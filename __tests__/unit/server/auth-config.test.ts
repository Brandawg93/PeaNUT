import { ensureAuthSecret } from '../../../src/server/auth-config'
import crypto from 'crypto'

// Mock crypto.randomBytes
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}))

describe('auth-config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset process.env to a clean state with required variables
    process.env = {
      NODE_ENV: 'test',
    }
  })

  afterEach(() => {
    // Restore original process.env after each test
    process.env = originalEnv
  })

  describe('ensureAuthSecret', () => {
    it('should generate a new AUTH_SECRET if it does not exist', () => {
      // Mock the randomBytes to return a predictable value
      const mockRandomBytes = Buffer.from('test-secret-32-bytes-long')
      ;(crypto.randomBytes as jest.Mock).mockReturnValue(mockRandomBytes)

      // Call the function
      ensureAuthSecret()

      // Verify crypto.randomBytes was called with correct parameters
      expect(crypto.randomBytes).toHaveBeenCalledWith(32)

      // Verify AUTH_SECRET was set correctly
      expect(process.env.AUTH_SECRET).toBe(mockRandomBytes.toString('base64'))
    })

    it('should not generate a new AUTH_SECRET if it already exists', () => {
      const existingSecret = 'existing-secret'
      process.env.AUTH_SECRET = existingSecret

      ensureAuthSecret()

      // Verify crypto.randomBytes was not called
      expect(crypto.randomBytes).not.toHaveBeenCalled()

      // Verify AUTH_SECRET remained unchanged
      expect(process.env.AUTH_SECRET).toBe(existingSecret)
    })

    it('should set AUTH_TRUST_HOST correctly when WEB_HOST and WEB_PORT are provided', () => {
      process.env.WEB_HOST = 'localhost'
      process.env.WEB_PORT = '3000'

      ensureAuthSecret()

      expect(process.env.AUTH_TRUST_HOST).toBe('http://localhost:3000')
    })

    it('should handle WEB_HOST that already includes http://', () => {
      process.env.WEB_HOST = 'http://localhost'
      process.env.WEB_PORT = '3000'

      ensureAuthSecret()

      expect(process.env.AUTH_TRUST_HOST).toBe('http://localhost:3000')
    })

    it('should not set AUTH_TRUST_HOST when WEB_HOST or WEB_PORT are missing', () => {
      // No need to explicitly delete variables as we start with clean environment
      ensureAuthSecret()

      expect(process.env.AUTH_TRUST_HOST).toBeUndefined()
    })
  })
})
