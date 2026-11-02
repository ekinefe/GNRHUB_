// Encrypts third-party API keys before they go into D1.
// AES-256-GCM, key derived with HKDF from a server secret and a purpose label,
// fresh random IV per value, and the context is bound as additional data so a
// ciphertext cannot be moved to another row. Web Crypto only, no dependency.
// Rotating the secret makes stored values unreadable: open() returns null and
// the key has to be entered again.

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const VERSION = 'v1'

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))
const fromBase64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0))

async function deriveKey(secret: string, purpose: string): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', encoder.encode(secret), 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: encoder.encode(`secretBox:${purpose}`) },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** Returns `v1.<iv>.<ciphertext>` (base64). `context` is e.g. the setting name. */
export async function seal(secret: string, purpose: string, context: string, plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(secret, purpose)
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(context) },
    key,
    encoder.encode(plain),
  )
  return `${VERSION}.${toBase64(iv)}.${toBase64(new Uint8Array(data))}`
}

/** The original text, or null for any wrong secret, purpose, context or damaged value. Never throws. */
export async function open(secret: string, purpose: string, context: string, sealed: string): Promise<string | null> {
  try {
    const [version, iv, data] = sealed.split('.')
    if (version !== VERSION || !iv || !data) return null
    const key = await deriveKey(secret, purpose)
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(iv), additionalData: encoder.encode(context) },
      key,
      fromBase64(data),
    )
    return decoder.decode(plain)
  } catch {
    return null
  }
}
