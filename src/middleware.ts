import NextAuth from 'next-auth'
import { getAuthConfig } from './auth.config'

const initMiddleware = async () => {
  const config = await getAuthConfig()
  return NextAuth(config).auth
}

const middleware = initMiddleware()

export default middleware

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
}
