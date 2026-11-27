import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'
import { authStorage } from './server/auth-storage'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z.object({ username: z.string(), password: z.string().min(5) }).safeParse(credentials)

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data
          const user = authStorage.getAuthUser()
          if (user && username === user.username && (await authStorage.verifyPassword(password))) {
            return { name: username }
          }
        }

        return null
      },
    }),
  ],
})
