/**
 * Verifies the Credentials provider `authorize` callback wired up in src/auth.ts.
 *
 * The next-auth mock at __tests__/__mocks__/next-auth.ts (applied via the
 * jest config moduleNameMapper) replaces the default export for both
 * `next-auth` and `next-auth/providers/credentials` with a single jest.fn.
 * That means when src/auth.ts evaluates:
 *
 *   NextAuth({ providers: [Credentials({ authorize })] })
 *
 * both inner calls are recorded on the same mock. The first recorded call
 * (index 0) corresponds to `Credentials({ authorize })`, so we can pull the
 * authorize callback off it and drive it directly with crafted credentials.
 */

const mockGetAuthUser = jest.fn()
const mockVerifyPassword = jest.fn()

jest.mock('@/server/auth-storage', () => ({
  authStorage: {
    getAuthUser: mockGetAuthUser,
    verifyPassword: mockVerifyPassword,
  },
}))

import { TEST_USERNAME, TEST_PASSWORD } from '../utils/test-constants'
import mockedNextAuth from 'next-auth'

describe('src/auth.ts Credentials authorize', () => {
  let authorize: (credentials: unknown) => Promise<unknown>

  beforeAll(async () => {
    // Importing the module triggers the NextAuth and Credentials calls.
    await import('@/auth')
    const calls = (mockedNextAuth as unknown as jest.Mock).mock.calls
    // First call records the Credentials({ authorize }) config object.
    authorize = calls[0][0].authorize
  })

  beforeEach(() => {
    mockGetAuthUser.mockReset()
    mockVerifyPassword.mockReset()
  })

  test('returns null when credentials are missing required fields', async () => {
    const result = await authorize({})
    expect(result).toBeNull()
    expect(mockGetAuthUser).not.toHaveBeenCalled()
  })

  test('returns null when password is too short to pass zod schema', async () => {
    const result = await authorize({ username: TEST_USERNAME, password: 'abc' })
    expect(result).toBeNull()
    expect(mockGetAuthUser).not.toHaveBeenCalled()
  })

  test('returns null when no auth user is configured', async () => {
    mockGetAuthUser.mockReturnValue(null)
    const result = await authorize({ username: TEST_USERNAME, password: TEST_PASSWORD })
    expect(result).toBeNull()
    expect(mockVerifyPassword).not.toHaveBeenCalled()
  })

  test('returns null when username does not match stored user', async () => {
    mockGetAuthUser.mockReturnValue({ username: 'other-user' })
    const result = await authorize({ username: TEST_USERNAME, password: TEST_PASSWORD })
    expect(result).toBeNull()
    expect(mockVerifyPassword).not.toHaveBeenCalled()
  })

  test('returns null when verifyPassword resolves false', async () => {
    mockGetAuthUser.mockReturnValue({ username: TEST_USERNAME })
    mockVerifyPassword.mockResolvedValue(false)
    const result = await authorize({ username: TEST_USERNAME, password: TEST_PASSWORD })
    expect(result).toBeNull()
    expect(mockVerifyPassword).toHaveBeenCalledWith(TEST_PASSWORD)
  })

  test('returns { name } on successful authentication', async () => {
    mockGetAuthUser.mockReturnValue({ username: TEST_USERNAME })
    mockVerifyPassword.mockResolvedValue(true)
    const result = await authorize({ username: TEST_USERNAME, password: TEST_PASSWORD })
    expect(result).toEqual({ name: TEST_USERNAME })
  })
})
