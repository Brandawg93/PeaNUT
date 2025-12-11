export function isAuthEnabled(): boolean {
  return Boolean(process.env.WEB_USERNAME?.trim() && process.env.WEB_PASSWORD?.trim())
}

// Store the generated secret in memory to ensure consistency across all contexts
let cachedAuthSecret: string | undefined

export function ensureAuthSecret(): string {
  // Always prefer the environment variable if it exists
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET
  }

  // Return cached secret if we've already generated one
  if (cachedAuthSecret) {
    return cachedAuthSecret
  }

  // Only generate a new secret if we're in the Node.js runtime and not during build phase
  if (process.env.NEXT_RUNTIME === 'nodejs' && !process.env.NEXT_PHASE) {
    // Generate a random 32-byte string using Web Crypto API (works in both Node.js and Edge)
    const randomBytes = new Uint8Array(32)
    globalThis.crypto.getRandomValues(randomBytes)
    const authSecret = Buffer.from(randomBytes).toString('base64')

    // Cache the generated secret for consistency
    cachedAuthSecret = authSecret
    process.env.AUTH_SECRET = authSecret

    if (isAuthEnabled()) {
      console.log(`Generated new AUTH_SECRET: ${authSecret}`)
    }

    return authSecret
  }

  // Fallback: generate without setting env var (for edge runtime, build time, etc.)
  if (!cachedAuthSecret) {
    const randomBytes = new Uint8Array(32)
    globalThis.crypto.getRandomValues(randomBytes)
    cachedAuthSecret = Buffer.from(randomBytes).toString('base64')
  }

  return cachedAuthSecret
}
