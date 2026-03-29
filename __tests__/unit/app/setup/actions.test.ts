import { createInitialUser } from '@/app/setup/actions'
import { authStorage } from '@/server/auth-storage'
import { redirect } from 'next/navigation'

jest.mock('@/server/auth-storage', () => ({
  authStorage: {
    hasUser: jest.fn(),
    setAuthUser: jest.fn(),
  },
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Setup Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('validates required fields', async () => {
    const formData = new FormData()
    formData.append('username', '')
    formData.append('password', '1234')

    const result = await createInitialUser(formData)

    expect(result).toEqual({ error: 'setup.errorUsernameRequired' })
    expect(authStorage.setAuthUser).not.toHaveBeenCalled()
  })

  it('validates password length', async () => {
    const formData = new FormData()
    formData.append('username', 'admin')
    formData.append('password', '1234')

    const result = await createInitialUser(formData)

    expect(result).toEqual({ error: 'setup.passwordHint' })
    expect(authStorage.setAuthUser).not.toHaveBeenCalled()
  })

  it('fails if user already exists', async () => {
    ;(authStorage.hasUser as jest.Mock).mockReturnValue(true)
    const formData = new FormData()
    formData.append('username', 'admin')
    formData.append('password', 'password123')

    const result = await createInitialUser(formData)

    expect(result).toEqual({ error: 'setup.errorUserExists' })
    expect(authStorage.setAuthUser).not.toHaveBeenCalled()
  })

  it('successfully creates initial user and redirects', async () => {
    ;(authStorage.hasUser as jest.Mock).mockReturnValue(false)
    ;(authStorage.setAuthUser as jest.Mock).mockResolvedValue(true)
    const formData = new FormData()
    formData.append('username', 'admin')
    formData.append('password', 'password123')

    await createInitialUser(formData)

    expect(authStorage.setAuthUser).toHaveBeenCalledWith('admin', 'password123')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('returns error if save fails', async () => {
    ;(authStorage.hasUser as jest.Mock).mockReturnValue(false)
    ;(authStorage.setAuthUser as jest.Mock).mockResolvedValue(false)
    const formData = new FormData()
    formData.append('username', 'admin')
    formData.append('password', 'password123')

    const result = await createInitialUser(formData)

    expect(result).toEqual({ error: 'setup.errorSaveFailed' })
    expect(redirect).not.toHaveBeenCalled()
  })
})
