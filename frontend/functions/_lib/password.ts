// Password hashing for the single admin (ADR 0009), on the Web Crypto API (no library).
// Stored form: pbkdf2$<iterations>$<salt>$<hash>, base64url. The iteration count travels with the hash, so it can be
// raised later without breaking the old one. Cloudflare Workers cap PBKDF2 at 100,000 iterations, which is also the default.
const MAX_ITERATIONS = 100_000;
const MIN_ITERATIONS = 1_000;
const HASH_BYTES = 32;
const SALT_BYTES = 16;

const b64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (text: string): Uint8Array => {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
};

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, HASH_BYTES * 8);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, iterations = MAX_ITERATIONS, salt?: Uint8Array): Promise<string> {
  if (iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) throw new Error(`iterations must be ${MIN_ITERATIONS} to ${MAX_ITERATIONS}`);
  const s = salt ?? crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return `pbkdf2$${iterations}$${b64(s)}$${b64(await derive(password, s, iterations))}`;
}

// Constant-time on the hash comparison; false (never a throw) for any malformed stored value.
export async function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  try {
    const [scheme, iter, salt, hash] = (stored ?? '').split('$');
    const iterations = Number(iter);
    if (scheme !== 'pbkdf2' || !Number.isInteger(iterations) || iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS || !salt || !hash) return false;
    const expected = unb64(hash);
    const actual = await derive(password, unb64(salt), iterations);
    if (expected.length !== actual.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i += 1) diff |= actual[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
}
