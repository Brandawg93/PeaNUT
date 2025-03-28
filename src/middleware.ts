import { NextRequest, NextResponse } from 'next/server'
import authMiddleware from './auth.middleware'

// Create a wrapper middleware that handles dynamic basePath
export async function middleware(request: NextRequest) {
  // Get the dynamic basePath from environment or request headers
  const dynamicBasePath = process.env.BASE_PATH || request.headers.get('x-base-path') || ''

  // Check auth first
  const authResult = await authMiddleware(request as any)
  if (authResult) {
    return authResult
  }

  // If we have a dynamic basePath, rewrite the URL
  if (dynamicBasePath) {
    const url = new URL(request.url)
    if (url.pathname.startsWith(dynamicBasePath)) {
      const rewrittenUrl = new URL(url.pathname.slice(dynamicBasePath.length), request.url)
      return NextResponse.rewrite(rewrittenUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
}
