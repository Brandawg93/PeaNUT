import NextAuth, { mockAuth, mockHandlers, mockSignIn, mockSignOut } from 'next-auth'
import { authConfig } from '@/auth.config'

describe('auth (NextAuth wrapper)', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('initializes NextAuth with our config and exposes functions', () => {
    // Re-require the module to trigger initialization
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const authExports = require('@/auth') as typeof import('@/auth')
      expect(NextAuth as unknown as jest.Mock).toHaveBeenCalled()
      // Handlers/signIn/signOut/auth should be proxied from our mock
      expect(authExports.handlers).toBe(mockHandlers)
      expect(authExports.auth).toBe(mockAuth)
      expect(authExports.signIn).toBe(mockSignIn)
      expect(authExports.signOut).toBe(mockSignOut)
    })
  })

  it('passes a providers array to NextAuth', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@/auth')
      const call = (NextAuth as unknown as jest.Mock).mock.calls.at(-1)
      const config = call && call[0]
      expect(Array.isArray(config.providers)).toBe(true)
    })
  })

  it('includes our shared authConfig fields', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@/auth')
      const call = (NextAuth as unknown as jest.Mock).mock.calls.at(-1)
      const config = call && call[0]
      expect(config.pages.signIn).toBe(authConfig.pages?.signIn)
      expect(typeof config.callbacks.authorized).toBe('function')
    })
  })
})

