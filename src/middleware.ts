import { NextRequest, NextResponse } from 'next/server'
import { env } from 'next-runtime-env'

// Normalize basePath to ensure consistent format (starts with /, no trailing slash)
function normalizeBasePath(path: string): string {
  // Remove trailing slash if present
  const withoutTrailingSlash = path.replace(/\/$/, '')
  // Ensure starts with /
  return withoutTrailingSlash.startsWith('/') ? withoutTrailingSlash : `/${withoutTrailingSlash}`
}

// Create a wrapper middleware that handles dynamic basePath
export async function middleware(request: NextRequest) {
  // Get the dynamic basePath from runtime environment or request headers and normalize it
  const dynamicBasePath = normalizeBasePath(env('BASE_PATH') || request.headers.get('x-base-path') || '')

  // If we have a dynamic basePath, rewrite the URL
  if (dynamicBasePath) {
    const url = new URL(request.url)
    // Normalize the pathname for comparison
    const normalizedPathname = normalizeBasePath(url.pathname)
    if (normalizedPathname.startsWith(dynamicBasePath)) {
      const rewrittenUrl = new URL(normalizedPathname.slice(dynamicBasePath.length), request.url)
      return NextResponse.rewrite(rewrittenUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
}
