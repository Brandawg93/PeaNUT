import { NextRequest, NextResponse } from 'next/server'
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const nuts = await getNutInstances()

  const versionPromises = nuts.map(async (nut) => {
    const version = await nut.getVersion()
    return version
  })

  const versions = await Promise.all(versionPromises)
  return NextResponse.json(versions)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
