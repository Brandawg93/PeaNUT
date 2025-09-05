import { authConfig } from '@/auth.config'

describe('auth.config authorized callback', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('allows all access when auth disabled', () => {
    delete process.env.WEB_USERNAME
    delete process.env.WEB_PASSWORD

    const authorized = authConfig.callbacks!.authorized as any
    const result = authorized({
      auth: null,
      request: { nextUrl: new URL('http://localhost/'), headers: new Headers() },
    })

    expect(result).toBe(true)
  })

  it('redirects to /login when not logged in and auth enabled', () => {
    process.env.WEB_USERNAME = 'admin'
    process.env.WEB_PASSWORD = 'secret123'

    const authorized = authConfig.callbacks!.authorized as any
    const result = authorized({
      auth: null,
      request: { nextUrl: new URL('http://localhost/'), headers: new Headers() },
    })

    // Should be a NextResponse redirect
    expect(result).toMatchObject({ headers: expect.any(Object) })
  })

  it('allows /login when auth enabled', () => {
    process.env.WEB_USERNAME = 'admin'
    process.env.WEB_PASSWORD = 'secret123'

    const authorized = authConfig.callbacks!.authorized as any
    const result = authorized({
      auth: null,
      request: { nextUrl: new URL('http://localhost/login'), headers: new Headers() },
    })

    expect(result).toBe(true)
  })

  it('allows when already logged in', () => {
    process.env.WEB_USERNAME = 'admin'
    process.env.WEB_PASSWORD = 'secret123'

    const authorized = authConfig.callbacks!.authorized as any
    const result = authorized({
      auth: { user: { name: 'admin' }, expires: new Date(Date.now() + 60_000).toISOString() },
      request: { nextUrl: new URL('http://localhost/'), headers: new Headers() },
    })

    expect(result).toBe(true)
  })

  it('allows non-v1 API routes without session', () => {
    process.env.WEB_USERNAME = 'admin'
    process.env.WEB_PASSWORD = 'secret123'

    const authorized = authConfig.callbacks!.authorized as any
    const result = authorized({
      auth: null,
      request: { nextUrl: new URL('http://localhost/api/ping'), headers: new Headers() },
    })

    expect(result).toBe(true)
  })

  it('requires Basic auth for /api/v1 routes', () => {
    process.env.WEB_USERNAME = 'admin'
    process.env.WEB_PASSWORD = 'secret123'

    const authorized = authConfig.callbacks!.authorized as any
    const result = authorized({
      auth: null,
      request: { nextUrl: new URL('http://localhost/api/v1/devices'), headers: new Headers() },
    })

    // Should be a NextResponse with 401 status
    expect(result).toMatchObject({ status: 401 })
  })

  it('accepts valid Basic auth for /api/v1 routes', () => {
    process.env.WEB_USERNAME = 'admin'
    process.env.WEB_PASSWORD = 'secret123'
    const creds = Buffer.from('admin:secret123').toString('base64')
    const headers = new Headers({ authorization: `Basic ${creds}` })

    const authorized = authConfig.callbacks!.authorized as any
    const result = authorized({
      auth: null,
      request: { nextUrl: new URL('http://localhost/api/v1/devices'), headers },
    })

    expect(result).toBe(true)
  })
})
