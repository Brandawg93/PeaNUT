import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl, headers } }) {
      // Check if authentication is enabled via env variables
      const authEnabled = process.env.USERNAME && process.env.PASSWORD

      // If auth is not enabled, allow all access
      if (!authEnabled) {
        return true
      }

      const isLoggedIn = !!auth?.user
      const isApiRoute = nextUrl.pathname.startsWith('/api')
      const isApiV1Route = nextUrl.pathname.startsWith('/api/v1')

      if (isApiRoute && !isApiV1Route) {
        return true
      }

      if (isApiV1Route) {
        // Get the Authorization header
        const authHeader = headers.get('authorization')

        if (!authHeader?.startsWith('Basic ')) {
          return new Response('Unauthorized', { status: 401 })
        }

        // Extract credentials from Basic auth header
        const base64Credentials = authHeader.split(' ')[1]
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
        const [username, password] = credentials.split(':')

        // Verify credentials against environment variables
        const isAuthorized = username === process.env.USERNAME && password === process.env.PASSWORD
        if (!isAuthorized) {
          return new Response('Unauthorized', { status: 401 })
        }
        return true
      }

      if (isLoggedIn) return true
      return false // Redirect unauthenticated users to login page
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
