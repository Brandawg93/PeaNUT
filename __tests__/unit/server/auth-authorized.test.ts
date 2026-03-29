import { authConfig } from '@/auth.config'
import { TEST_USERNAME, TEST_PASSWORD } from '../../utils/test-constants'

describe('auth.config authorized callback', () => {
  const originalEnv = { ...process.env }
  const originalFetch = global.fetch

  afterEach(() => {
    process.env = { ...originalEnv }
    global.fetch = originalFetch
  })

  // Helper functions to reduce duplication
  const setupAuth = () => {
    process.env.WEB_USERNAME = TEST_USERNAME
    process.env.WEB_PASSWORD = TEST_PASSWORD
  }

  const disableAuth = () => {
    process.env.AUTH_DISABLED = 'true'
    delete process.env.WEB_USERNAME
    delete process.env.WEB_PASSWORD
  }

  const callAuthorized = (auth: any, url: string, headers: Headers = new Headers()) => {
    const authorized = authConfig.callbacks.authorized as any
    return authorized({
      auth,
      request: { nextUrl: new URL(url), headers },
    })
  }

  const createBasicAuthHeaders = (username: string, password: string) => {
    const creds = Buffer.from(`${username}:${password}`).toString('base64')
    return new Headers({ authorization: `Basic ${creds}` })
  }

  it('allows all access when auth disabled', async () => {
    disableAuth()

    const result = await callAuthorized(null, 'http://localhost/')

    expect(result).toBe(true)
  })

  it('redirects to /login when not logged in and auth enabled', async () => {
    setupAuth()

    const result = await callAuthorized(null, 'http://localhost/')

    // Should be a NextResponse redirect
    expect(result).toMatchObject({ headers: expect.any(Object) })
  })

  it('allows /login when auth enabled', async () => {
    setupAuth()

    const result = await callAuthorized(null, 'http://localhost/login')

    expect(result).toBe(true)
  })

  it('allows when already logged in', async () => {
    setupAuth()

    const auth = { user: { name: TEST_USERNAME }, expires: new Date(Date.now() + 60_000).toISOString() }
    const result = await callAuthorized(auth, 'http://localhost/')

    expect(result).toBe(true)
  })

  it('allows non-v1 API routes without session', async () => {
    setupAuth()

    const result = await callAuthorized(null, 'http://localhost/api/ping')

    expect(result).toBe(true)
  })

  it('requires Basic auth for /api/v1 routes', async () => {
    setupAuth()

    const result = await callAuthorized(null, 'http://localhost/api/v1/devices')

    // Should be a NextResponse with 401 status
    expect(result).toMatchObject({ status: 401 })
  })

  it('accepts valid Basic auth for /api/v1 routes via env vars', async () => {
    setupAuth()

    const headers = createBasicAuthHeaders(TEST_USERNAME, TEST_PASSWORD)
    const result = await callAuthorized(null, 'http://localhost/api/v1/devices', headers)

    expect(result).toBe(true)
  })

  it('accepts valid Basic auth for /api/v1 routes via internal verify', async () => {
    // No env vars set — must go through the internal verify endpoint
    delete process.env.WEB_USERNAME
    delete process.env.WEB_PASSWORD

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ valid: true }),
    })

    const headers = createBasicAuthHeaders('storeduser', 'storedpass')
    const result = await callAuthorized(null, 'http://localhost/api/v1/devices', headers)

    expect(result).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost/api/auth/verify',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('rejects invalid Basic auth when verify endpoint returns invalid', async () => {
    delete process.env.WEB_USERNAME
    delete process.env.WEB_PASSWORD

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ valid: false }),
    })

    const headers = createBasicAuthHeaders('baduser', 'badpass')
    const result = await callAuthorized(null, 'http://localhost/api/v1/devices', headers)

    expect(result).toMatchObject({ status: 401 })
  })
})
