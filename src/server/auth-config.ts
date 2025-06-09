export function ensureAuthSecret() {
  if (!process.env.AUTH_SECRET) {
    // Generate a random 32-byte string using Web Crypto API (works in both Node.js and Edge)
    const randomBytes = new Uint8Array(32)
    globalThis.crypto.getRandomValues(randomBytes)
    const authSecret = Buffer.from(randomBytes).toString('base64')
    process.env.AUTH_SECRET = authSecret
    console.log(`Generated new AUTH_SECRET: ${authSecret}`)
    return authSecret
  }
  console.log(`AUTH_SECRET already exists: ${process.env.AUTH_SECRET}`)
  return process.env.AUTH_SECRET
}
