import type { NextAuthConfig } from 'next-auth'
import { NextResponse } from 'next/server'
import { ensureAuthSecret } from './server/auth-config'
// Remove authStorage import as it's not Edge-compatible

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl, headers } }) {
      const authDisabled = process.env.AUTH_DISABLED === 'true'

      // If auth is disabled, allow all access
      if (authDisabled) {
        return true
      }

      const isApiRoute = nextUrl.pathname.startsWith('/api')
      const isApiV1Route = nextUrl.pathname.startsWith('/api/v1')

      if (isApiRoute && !isApiV1Route) {
        return true
      }

      if (isApiV1Route) {
        // Get the Authorization header
        const authHeader = headers.get('authorization')

        if (!authHeader?.startsWith('Basic ')) {
          return NextResponse.json('Unauthorized', { status: 401 })
        }

        // Extract credentials from Basic auth header
        const base64Credentials = authHeader.split(' ')[1]
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
        const [username, password] = credentials.split(':')

        // For API v1, we used to check process.env.WEB_PASSWORD.
        // Since we can't easily check the hash here in Edge, let's allow it if it matches the env var
        // OR handle API auth differently.
        // Actually, if the user didn't set env vars, API Basic auth might stay disabled or we'd need a different way.
        // For now, let's keep it simple: if WEB_PASSWORD is set, use it for API.
        const isAuthorized = username === process.env.WEB_USERNAME && password === process.env.WEB_PASSWORD
        if (!isAuthorized) {
          return NextResponse.json('Unauthorized', { status: 401 })
        }
        return true
      }

      const isLoggedIn = !!auth?.user
      const isLoginPage = nextUrl.pathname === '/login'
      const isSetupPage = nextUrl.pathname === '/setup'

      if (isLoggedIn || isLoginPage || isSetupPage) {
        return true
      }

      // Determine external base path for reverse proxies
      const rawBasePath = (process.env.BASE_PATH || headers.get('x-base-path') || '').trim()
      let basePath = ''
      if (rawBasePath && rawBasePath !== '/') {
        basePath = rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`
      }
      const loginPath = `${basePath}/login`
      if (nextUrl.pathname === loginPath) return true
      return NextResponse.redirect(new URL(`${loginPath}?callbackUrl=${nextUrl.pathname}`, nextUrl.origin))
    },
  },
  providers: [], // Add providers with an empty array for now
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? ensureAuthSecret(),
} satisfies NextAuthConfig
