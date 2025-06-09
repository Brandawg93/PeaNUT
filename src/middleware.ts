import NextAuth from 'next-auth'
import { getAuthConfig } from './auth.config'

const initMiddleware = async () => {
  const config = await getAuthConfig()
  return NextAuth(config).auth
}

export default await initMiddleware()

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
}
