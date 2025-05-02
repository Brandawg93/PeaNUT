import crypto from 'crypto'

export function ensureAuthSecret() {
  if (!process.env.AUTH_SECRET) {
    // Generate a random 32-byte string and encode it as base64
    const randomBytes = crypto.randomBytes(32)
    const authSecret = randomBytes.toString('base64')
    process.env.AUTH_SECRET = authSecret
    console.log(`Generated new AUTH_SECRET: ${authSecret}`)
  } else {
    console.log(`AUTH_SECRET already exists: ${process.env.AUTH_SECRET}`)
  }
}
