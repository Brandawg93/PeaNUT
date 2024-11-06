import { NextResponse } from 'next/server'
import { getNutInstance } from '@/app/api/utils'

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
  const nut = await getNutInstance()
  const data = await nut.getNetVersion()
  return NextResponse.json(data)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
