import { auth } from '@/auth'

const handler = auth()
export { handler as GET, handler as POST }
