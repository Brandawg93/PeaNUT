const mockHandlers = {
  GET: jest.fn(),
  POST: jest.fn(),
}

const mockAuth = jest.fn()
const mockSignIn = jest.fn()
const mockSignOut = jest.fn()

const NextAuth = jest.fn().mockImplementation(() => ({
  auth: mockAuth,
  signIn: mockSignIn,
  signOut: mockSignOut,
  handlers: mockHandlers,
}))

class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export { AuthError, mockHandlers, mockAuth, mockSignIn, mockSignOut }
export default NextAuth
