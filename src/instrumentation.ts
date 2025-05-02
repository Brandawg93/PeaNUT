'use server'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./server/scheduler')
    // Import and run auth secret check
    if (process.env.WEB_USERNAME && process.env.WEB_PASSWORD) {
      const { ensureAuthSecret } = await import('./server/auth-config')
      ensureAuthSecret()
    }
  }
}
