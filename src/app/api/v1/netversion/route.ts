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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const nuts = await getNutInstances()

  const netVersionPromises = nuts.map(async (nut) => {
    const netVersion = await nut.getNetVersion()
    return netVersion
  })

  const netVersions = await Promise.all(netVersionPromises)
  return NextResponse.json(netVersions)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
