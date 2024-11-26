import { NextResponse } from 'next/server'
import { getNutInstances } from '@/app/api/utils'

/**
 * Shows the version of the server currently in use.
 *
 * @swagger
 * /api/v1/version:
 *   get:
 *     summary: Shows the version of the server currently in use
 *     responses:
 *       '200':
 *         description: Successful response with server version
 *     tags:
 *       - Version
 */
export async function GET() {
  const nuts = await getNutInstances()
  const promises = await nuts.map((nut) => nut.getVersion())
  const data = await Promise.all(promises)
  return NextResponse.json(data)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
