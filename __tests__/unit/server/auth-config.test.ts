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
  })
})
