import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getAuthConfig } from './auth.config'
import { z } from 'zod'

const initAuth = async () => {
  const config = await getAuthConfig()
  return NextAuth({
    ...config,
    providers: [
      Credentials({
        async authorize(credentials) {
          const parsedCredentials = z
            .object({ username: z.string(), password: z.string().min(6) })
            .safeParse(credentials)

          if (parsedCredentials.success) {
            const { username, password } = parsedCredentials.data
            if (username === process.env.WEB_USERNAME && password === process.env.WEB_PASSWORD) {
              return { name: username }
            }
          }

          return null
        },
      }),
    ],
  })
}

export const { handlers, auth, signIn, signOut } = await initAuth()
