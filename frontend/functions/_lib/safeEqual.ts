// Compares two strings without leaking, through timing, where they first differ: both are hashed to the same
// length first, then compared byte by byte without an early exit.
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const xa = new Uint8Array(x);
  const ya = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < xa.length; i += 1) diff |= xa[i] ^ ya[i];
  return diff === 0;
}
