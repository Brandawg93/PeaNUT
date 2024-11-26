import { NextResponse } from 'next/server'
import { getNutInstances } from '@/app/api/utils'

/**
 * shows the version of the network protocol currently in use.
 *
 * @swagger
 * /api/v1/netversion:
 *   get:
 *     summary: shows the version of the network protocol currently in use
 *     responses:
 *       '200':
 *         description: Successful response with network version
 *     tags:
 *       - Version
 */
export async function GET() {
  const nuts = await getNutInstances()
  const promises = await nuts.map((nut) => nut.getNetVersion())
  const data = await Promise.all(promises)
  return NextResponse.json(data)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
