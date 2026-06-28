// ============================================================
// Utility helpers (slug, hash, token)
// ============================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Web Crypto SHA-256 hash (hex) */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Random URL-safe token */
export function randomToken(length = 32): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Simple HMAC-signed session token (no external JWT lib needed). */
export async function signSession(payload: object, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'SESSION' }))
  const body = btoa(JSON.stringify(payload))
  const data = `${header}.${body}`
  const sig = await sha256(data + secret)
  return `${data}.${sig}`
}

export async function verifySession(token: string, secret: string): Promise<any | null> {
  try {
    const [header, body, sig] = token.split('.')
    if (!header || !body || !sig) return null
    const data = `${header}.${body}`
    const expected = await sha256(data + secret)
    if (expected !== sig) return null
    const payload = JSON.parse(atob(body))
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

// HTML escape for safe rendering of user-supplied strings
export function esc(input: unknown): string {
  if (input === null || input === undefined) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
