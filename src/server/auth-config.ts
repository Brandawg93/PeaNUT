export function isAuthEnabled(): boolean {
  return Boolean(process.env.WEB_USERNAME?.trim() && process.env.WEB_PASSWORD?.trim())
}

export function ensureAuthSecret() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && !process.env.NEXT_PHASE) {
    if (!process.env.AUTH_SECRET) {
      // Generate a random 32-byte string using Web Crypto API (works in both Node.js and Edge)
      const randomBytes = new Uint8Array(32)
      globalThis.crypto.getRandomValues(randomBytes)
      const authSecret = Buffer.from(randomBytes).toString('base64')
      process.env.AUTH_SECRET = authSecret
      if (isAuthEnabled()) {
        console.log(`Generated new AUTH_SECRET: ${authSecret}`)
      }
      return authSecret
    }
    console.log(`AUTH_SECRET already exists: ${process.env.AUTH_SECRET}`)
    return process.env.AUTH_SECRET
  }
  return process.env.AUTH_SECRET
}
