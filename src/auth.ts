import { timingSafeEqual } from 'crypto'
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
          if (username === process.env.WEB_USERNAME && process.env.WEB_PASSWORD && (() => { try { return timingSafeEqual(Buffer.from(password), Buffer.from(process.env.WEB_PASSWORD)) } catch { return false } })()) {
            return { name: username }
          }
        }

        return null
      },
    }),
  ],
})
