'use server'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./server/scheduler')

    // Auto-create user if environment variables are set and no user exists
    const { authStorage } = await import('./server/auth-storage')
    if (!authStorage.hasUser()) {
      const username = process.env.WEB_USERNAME
      const password = process.env.WEB_PASSWORD

      if (username?.trim() && password?.trim()) {
        await authStorage.setAuthUser(username, password)
        console.log('PeaNUT: Initial user created automatically from environment variables.')
      }
    }
  }
}
