export async function ensureAuthSecret() {
  if (!process.env.AUTH_SECRET && process.env.NEXT_RUNTIME === 'nodejs') {
    // Generate a random 32-byte string and encode it as base64
    const crypto = await import('crypto')
    const randomBytes = crypto.randomBytes(32)
    const authSecret = randomBytes.toString('base64')
    process.env.AUTH_SECRET = authSecret
    console.log(`Generated new AUTH_SECRET: ${authSecret}`)
    return authSecret
  }
  console.log(`AUTH_SECRET already exists: ${process.env.AUTH_SECRET}`)
  return process.env.AUTH_SECRET
}
