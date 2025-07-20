import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(_request: NextRequest) {
  const nuts = await getNutInstances()

  const netVersionPromises = nuts.map((nut) => nut.getNetVersion())

  const netVersions = await Promise.all(netVersionPromises)
  return NextResponse.json(netVersions)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
