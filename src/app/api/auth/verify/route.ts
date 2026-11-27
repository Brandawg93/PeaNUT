import { NextRequest, NextResponse } from 'next/server'
import { authStorage } from '@/server/auth-storage'

export async function POST(request: NextRequest) {
  try {
    // Basic security check: ensure the request has the internal secret
    const secret = request.headers.get('x-internal-verify-secret')
    if (!secret || secret !== process.env.AUTH_SECRET) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    // Check environment variables (existing behavior for override/legacy)
    if (process.env.WEB_USERNAME && process.env.WEB_PASSWORD) {
      if (username === process.env.WEB_USERNAME && password === process.env.WEB_PASSWORD) {
        return NextResponse.json({ valid: true })
      }
    }

    // Check against stored user credentials (consistent with web UI)
    const user = authStorage.getAuthUser()
    if (user && username === user.username && (await authStorage.verifyPassword(password))) {
      return NextResponse.json({ valid: true })
    }
  } catch (error) {
    console.error('API verifying authentication error:', error)
  }

  return NextResponse.json({ valid: false }, { status: 401 })
}

export const dynamic = 'force-dynamic'
