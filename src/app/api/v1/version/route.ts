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

export async function GET(_request: NextRequest) {
  const nuts = await getNutInstances()

  const versionPromises = nuts.map((nut) => nut.getVersion())
  const versions = await Promise.all(versionPromises)
  return NextResponse.json(versions)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
