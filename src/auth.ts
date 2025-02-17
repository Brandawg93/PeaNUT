import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z.object({ username: z.string(), password: z.string().min(6) }).safeParse(credentials)

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data
          if (username === process.env.USERNAME && password === process.env.PASSWORD) {
            return { name: username }
          }
        }

        return null
      },
    }),
  ],
})
