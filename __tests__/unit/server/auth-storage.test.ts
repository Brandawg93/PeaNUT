import { AuthStorage } from '@/server/auth-storage'
import fs from 'node:fs'

jest.mock('node:fs')
jest.mock('js-yaml', () => ({
  load: jest.fn(),
  dump: jest.fn((data) => JSON.stringify(data)),
}))
jest.mock('@/server/debug', () => ({
  createDebugLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}))

describe('AuthStorage', () => {
  let authStorage: AuthStorage

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear the singleton instance for each test
    // @ts-expect-error: Resetting singleton instance for testing purposes
    AuthStorage.instance = undefined
    authStorage = AuthStorage.getInstance()
  })

  it('should be a singleton', () => {
    const instance2 = AuthStorage.getInstance()
    expect(authStorage).toBe(instance2)
  })

  it('should initially have no user if file does not exist', () => {
    expect(authStorage.hasUser()).toBe(false)
    expect(authStorage.getAuthUser()).toBe(null)
  })

  it('should set and save a user', async () => {
    const username = 'admin'
    const password = 'password123'

    await authStorage.setAuthUser(username, password)

    expect(authStorage.hasUser()).toBe(true)
    const user = authStorage.getAuthUser()
    expect(user?.username).toBe(username)
    expect(user?.passwordHash).toBeDefined()
    expect(user?.passwordHash).not.toBe(password)

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ mode: 0o600 })
    )
  })

  describe('setAuthUser validation', () => {
    it('should fail if username is empty', async () => {
      const success = await authStorage.setAuthUser('', 'password123')
      expect(success).toBe(false)
      expect(authStorage.hasUser()).toBe(false)
    })

    it('should fail if username is only whitespace', async () => {
      const success = await authStorage.setAuthUser('   ', 'password123')
      expect(success).toBe(false)
      expect(authStorage.hasUser()).toBe(false)
    })

    it('should fail if password is too short', async () => {
      const success = await authStorage.setAuthUser('admin', '1234')
      expect(success).toBe(false)
      expect(authStorage.hasUser()).toBe(false)
    })

    it('should fail if password is empty', async () => {
      const success = await authStorage.setAuthUser('admin', '')
      expect(success).toBe(false)
      expect(authStorage.hasUser()).toBe(false)
    })
  })

  it('should verify correct password', async () => {
    const username = 'admin'
    const password = 'password123'

    await authStorage.setAuthUser(username, password)

    const isValid = await authStorage.verifyPassword(password)
    expect(isValid).toBe(true)
  })

  it('should not verify incorrect password', async () => {
    const username = 'admin'
    const password = 'password123'

    await authStorage.setAuthUser(username, password)

    const isValid = await authStorage.verifyPassword('wrongpassword')
    expect(isValid).toBe(false)
  })
})
