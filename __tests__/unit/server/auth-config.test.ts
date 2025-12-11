// Mock Web Crypto API
let mockGetRandomValues: jest.Mock
const originalEnv = process.env
let originalGetRandomValues: typeof globalThis.crypto.getRandomValues | undefined

describe('auth-config', () => {
  let ensureAuthSecret: typeof import('../../../src/server/auth-config').ensureAuthSecret

  beforeEach(async () => {
    process.env = {
      NODE_ENV: 'test',
      NEXT_RUNTIME: 'nodejs',
    }
    jest.clearAllMocks()
    jest.resetModules()
    // If crypto is not defined, define it
    if (!globalThis.crypto) (globalThis as any).crypto = {}
    // Save the original getRandomValues if it exists
    originalGetRandomValues = globalThis.crypto.getRandomValues
    // Set up the mock
    mockGetRandomValues = jest.fn()
    if (typeof originalGetRandomValues === 'function') {
      jest.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(mockGetRandomValues)
    } else {
      ;(globalThis.crypto as any).getRandomValues = mockGetRandomValues
    }
    // Import after setting up the mock
    ensureAuthSecret = (await import('../../../src/server/auth-config')).ensureAuthSecret
  })

  afterEach(() => {
    process.env = originalEnv
    // Restore the original getRandomValues if it existed
    if (typeof originalGetRandomValues === 'function') {
      if (typeof (globalThis.crypto.getRandomValues as any).mockRestore === 'function') {
        ;(globalThis.crypto.getRandomValues as any).mockRestore()
      }
      globalThis.crypto.getRandomValues = originalGetRandomValues
    } else {
      delete (globalThis.crypto as any).getRandomValues
    }
  })

  describe('ensureAuthSecret', () => {
    it('should return existing AUTH_SECRET if it exists', () => {
      const existingSecret = 'existing-secret'
      process.env.AUTH_SECRET = existingSecret

      const result = ensureAuthSecret()

      expect(mockGetRandomValues).not.toHaveBeenCalled()
      expect(result).toBe(existingSecret)
      expect(process.env.AUTH_SECRET).toBe(existingSecret)
    })

    it('should generate a new AUTH_SECRET if it does not exist', () => {
      const mockRandomBytes = new Uint8Array(32)
      for (let i = 0; i < 32; i++) {
        mockRandomBytes[i] = i
      }
      mockGetRandomValues.mockImplementation((array: Uint8Array) => {
        array.set(mockRandomBytes)
        return array
      })

      const result = ensureAuthSecret()

      expect(mockGetRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))
      expect(mockGetRandomValues.mock.calls[0][0].length).toBe(32)
      expect(result).toBe(Buffer.from(mockRandomBytes).toString('base64'))
      expect(process.env.AUTH_SECRET).toBe(Buffer.from(mockRandomBytes).toString('base64'))
    })

    it('should return the same cached secret on subsequent calls', () => {
      const mockRandomBytes = new Uint8Array(32)
      for (let i = 0; i < 32; i++) {
        mockRandomBytes[i] = i
      }
      mockGetRandomValues.mockImplementation((array: Uint8Array) => {
        array.set(mockRandomBytes)
        return array
      })

      const result1 = ensureAuthSecret()
      const result2 = ensureAuthSecret()
      const result3 = ensureAuthSecret()

      expect(mockGetRandomValues).toHaveBeenCalledTimes(1)
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
      expect(result1).toBe(Buffer.from(mockRandomBytes).toString('base64'))
    })
  })
})
