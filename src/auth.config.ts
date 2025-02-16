import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Check if authentication is enabled via env variables
      const authEnabled = process.env.USERNAME && process.env.PASSWORD

      // If auth is not enabled, allow all access
      if (!authEnabled) {
        return true
      }

      const isLoggedIn = !!auth?.user
      const isApiRoute = nextUrl.pathname.startsWith('/api')

      if (isApiRoute) {
        return true // Allow API routes to be accessed without authentication
      }

      if (isLoggedIn) return true
      return false // Redirect unauthenticated users to login page
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
