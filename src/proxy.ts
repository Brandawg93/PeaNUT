import { NextRequest, NextResponse } from 'next/server'
import { env } from 'next-runtime-env'
import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)

// Normalize basePath to ensure consistent format (starts with /, no trailing slash)
function normalizeBasePath(path: string): string {
  // Remove trailing slash if present
  const withoutTrailingSlash = path.replace(/\/$/, '')
  // Ensure starts with /
  return withoutTrailingSlash.startsWith('/') ? withoutTrailingSlash : `/${withoutTrailingSlash}`
}

// Create a wrapper proxy that handles dynamic basePath
export default auth(async function proxy(request: NextRequest) {
  // Get the dynamic basePath from runtime environment or request headers and normalize it
  const dynamicBasePath = normalizeBasePath(env('NEXT_PUBLIC_BASE_PATH') || request.headers.get('x-base-path') || '')

  // If we have a dynamic basePath, rewrite the URL
  if (dynamicBasePath) {
    const url = new URL(request.url)
    const pathname = url.pathname

    // Handle the case where the pathname exactly matches the base path (e.g., /my-app)
    if (pathname === dynamicBasePath) {
      const rewrittenUrl = new URL('/', request.url)
      return NextResponse.rewrite(rewrittenUrl)
    }

    // Handle the case where the pathname starts with the base path (e.g., /my-app/something)
    if (pathname.startsWith(dynamicBasePath + '/')) {
      const newPathname = pathname.slice(dynamicBasePath.length)
      const rewrittenUrl = new URL(newPathname, request.url)
      return NextResponse.rewrite(rewrittenUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
}
