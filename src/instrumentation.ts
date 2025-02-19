'use server'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./server/scheduler')
    // Import and run auth secret check
    const { ensureAuthSecret } = await import('./server/auth-config')
    ensureAuthSecret()
  }
}
