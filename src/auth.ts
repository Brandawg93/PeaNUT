import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getAuthConfig } from './auth.config'
import { z } from 'zod'
import { NextRequest } from 'next/server'

export const initAuth = async () => {
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

let authInstance: Awaited<ReturnType<typeof initAuth>> | null = null

export const getAuth = async () => {
  authInstance ??= await initAuth()
  return authInstance
}

// Export individual functions that will be initialized lazily
export const handlers = {
  GET: async (req: NextRequest) => {
    const auth = await getAuth()
    return auth.handlers.GET(req)
  },
  POST: async (req: NextRequest) => {
    const auth = await getAuth()
    return auth.handlers.POST(req)
  },
}

export const auth = async () => {
  const authInstance = await getAuth()
  return authInstance.auth()
}

export const signIn = async (...args: Parameters<Awaited<ReturnType<typeof getAuth>>['signIn']>) => {
  const authInstance = await getAuth()
  return authInstance.signIn(...args)
}

export const signOut = async (...args: Parameters<Awaited<ReturnType<typeof getAuth>>['signOut']>) => {
  const authInstance = await getAuth()
  return authInstance.signOut(...args)
}
