import { POST } from '@/app/api/auth/verify/route'
import { authStorage } from '@/server/auth-storage'

// Mock next/server to work in Jest (no Edge Runtime)
jest.mock('next/server', () => {
  class MockNextResponse {
    status: number
    private _data: unknown
    constructor(body: string, init?: { status?: number }) {
      this._data = body
      this.status = init?.status || 200
    }
    json() {
      return Promise.resolve(this._data)
    }
    static json(data: unknown, options?: { status?: number }) {
      const res = new MockNextResponse('', options)
      res._data = data
      return res
    }
  }

  return {
    NextRequest: jest.fn(),
    NextResponse: MockNextResponse,
  }
})

jest.mock('@/server/auth-storage', () => ({
  authStorage: {
    getAuthUser: jest.fn(),
    verifyPassword: jest.fn(),
  },
}))

const AUTH_SECRET = 'test-secret'

function createMockRequest(body: Record<string, unknown>, secret?: string) {
  const headers = new Map<string, string>()
  if (secret) {
    headers.set('x-internal-verify-secret', secret)
  }
  return {
    headers: {
      get: (name: string) => headers.get(name) ?? null,
    },
    json: () => Promise.resolve(body),
  } as any
}

describe('POST /api/auth/verify', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv, AUTH_SECRET }
    delete process.env.WEB_USERNAME
    delete process.env.WEB_PASSWORD
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns 403 if secret header is missing', async () => {
    const res = await POST(createMockRequest({ username: 'admin', password: 'pass' }))
    expect(res.status).toBe(403)
  })

  it('returns 403 if secret header is wrong', async () => {
    const res = await POST(createMockRequest({ username: 'admin', password: 'pass' }, 'wrong-secret'))
    expect(res.status).toBe(403)
  })

  it('returns 400 if username or password is missing', async () => {
    const res = await POST(createMockRequest({ username: '', password: '' }, AUTH_SECRET))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.valid).toBe(false)
  })

  it('returns valid when env var credentials match', async () => {
    process.env.WEB_USERNAME = 'envuser'
    process.env.WEB_PASSWORD = 'envpass'

    const res = await POST(createMockRequest({ username: 'envuser', password: 'envpass' }, AUTH_SECRET))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.valid).toBe(true)
  })

  it('returns valid when stored credentials match', async () => {
    ;(authStorage.getAuthUser as jest.Mock).mockReturnValue({ username: 'admin', passwordHash: 'hashed' })
    ;(authStorage.verifyPassword as jest.Mock).mockResolvedValue(true)

    const res = await POST(createMockRequest({ username: 'admin', password: 'password123' }, AUTH_SECRET))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.valid).toBe(true)
    expect(authStorage.verifyPassword).toHaveBeenCalledWith('password123')
  })

  it('returns 401 when stored credentials do not match', async () => {
    ;(authStorage.getAuthUser as jest.Mock).mockReturnValue({ username: 'admin', passwordHash: 'hashed' })
    ;(authStorage.verifyPassword as jest.Mock).mockResolvedValue(false)

    const res = await POST(createMockRequest({ username: 'admin', password: 'wrong' }, AUTH_SECRET))
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(body.valid).toBe(false)
  })

  it('returns 401 when no user exists and no env vars set', async () => {
    ;(authStorage.getAuthUser as jest.Mock).mockReturnValue(null)

    const res = await POST(createMockRequest({ username: 'anyone', password: 'anything' }, AUTH_SECRET))
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(body.valid).toBe(false)
  })

  it('env var credentials take priority over stored credentials', async () => {
    process.env.WEB_USERNAME = 'envuser'
    process.env.WEB_PASSWORD = 'envpass'

    const res = await POST(createMockRequest({ username: 'envuser', password: 'envpass' }, AUTH_SECRET))
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(authStorage.getAuthUser).not.toHaveBeenCalled()
  })
})
