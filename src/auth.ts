import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getAuthConfig } from './auth.config'
import type { User } from 'next-auth'

let authInstance: ReturnType<typeof NextAuth> | null = null

export async function initAuth() {
  if (!authInstance) {
    const config = await getAuthConfig()
    authInstance = NextAuth({
      ...config,
      providers: [
        CredentialsProvider({
          name: 'Credentials',
          credentials: {
            username: { label: 'Username', type: 'text' },
            password: { label: 'Password', type: 'password' },
          },
          async authorize(credentials: Partial<Record<'username' | 'password', unknown>>): Promise<User | null> {
            if (!credentials?.username || !credentials?.password) {
              return null
            }
            return { id: '1', name: String(credentials.username) }
          },
        }),
      ],
    })
  }
  return authInstance
}

// Initialize auth only in non-test environments
if (process.env.NODE_ENV !== 'test') {
  initAuth().catch(console.error)
}

export const auth = () => {
  if (!authInstance) {
    throw new Error('Auth not initialized')
  }
  return authInstance
}

export const signIn = (...args: Parameters<ReturnType<typeof auth>['signIn']>) => {
  return auth().signIn(...args)
}

export const signOut = (...args: Parameters<ReturnType<typeof auth>['signOut']>) => {
  return auth().signOut(...args)
}
