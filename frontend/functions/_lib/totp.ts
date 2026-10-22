// Two-factor codes for the admin (ADR 0010): TOTP as in RFC 6238 (HMAC-SHA1, 30 second steps, 6 digits), the format
// every authenticator app understands (Proton Authenticator, Aegis, Google Authenticator...). Web Crypto only.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const STEP_SECONDS = 30;

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0, value = 0, out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) { out += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

/** Tolerates lower case, spaces, hyphens and padding, as people paste secrets that way. */
export function base32Decode(text: string): Uint8Array {
  const clean = text.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const i = ALPHABET.indexOf(ch);
    if (i === -1) throw new Error('Not a base32 secret');
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Uint8Array.from(out);
}

export function newTotpSecret(): string {
  return base32Encode(crypto.getRandomValues(new Uint8Array(20)));
}

export const stepAt = (nowMs: number): number => Math.floor(nowMs / 1000 / STEP_SECONDS);

/** The 6-digit code for one 30-second step. */
export async function totpCode(secret: string, step: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', base32Decode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const counter = new Uint8Array(8);
  new DataView(counter.buffer).setUint32(4, step >>> 0);
  new DataView(counter.buffer).setUint32(0, Math.floor(step / 2 ** 32));
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, counter));
  const offset = mac[mac.length - 1] & 0x0f;
  const binary = ((mac[offset] & 0x7f) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
  return String(binary % 1_000_000).padStart(6, '0');
}

/**
 * The step a submitted code belongs to (this one, or one either side for clock drift), or null.
 * All three candidates are always computed and compared without an early exit.
 */
export async function verifyTotp(secret: string, submitted: string, nowMs = Date.now(), window = 1): Promise<number | null> {
  const code = String(submitted).replace(/\s/g, '');
  if (!/^\d{6}$/.test(code)) return null;
  const now = stepAt(nowMs);
  let found: number | null = null;
  for (let step = now - window; step <= now + window; step += 1) {
    const expected = await totpCode(secret, step);
    let diff = 0;
    for (let i = 0; i < 6; i += 1) diff |= expected.charCodeAt(i) ^ code.charCodeAt(i);
    if (diff === 0) found = step;
  }
  return found;
}

export const otpauthUri = (secret: string, account: string, issuer: string): string =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${STEP_SECONDS}`;

type D1 = { prepare: (sql: string) => { bind: (...v: unknown[]) => { run: () => Promise<{ meta?: { changes?: number } }> } } };

/** Remembers the newest step used, so the same code cannot be used twice. False if this step (or a newer one) was already used. */
export async function acceptStep(db: D1, step: number): Promise<boolean> {
  const run = await db
    .prepare('INSERT INTO admin_totp (id, last_step) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET last_step = excluded.last_step WHERE excluded.last_step > admin_totp.last_step')
    .bind(step)
    .run();
  return (run.meta?.changes ?? 0) > 0;
}
