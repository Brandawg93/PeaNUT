import { NextRequest, NextResponse } from 'next/server'
import packageJson from '../../../../../package.json'

/**
 * Shows information about the PeaNUT application itself.
 *
 * @swagger
 * /api/v1/info:
 *   get:
 *     summary: Shows information about the PeaNUT application
 *     responses:
 *       '200':
 *         description: Successful response with application information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Application name
 *                 version:
 *                   type: string
 *                   description: Application version
 *                 description:
 *                   type: string
 *                   description: Application description
 *                 nodeVersion:
 *                   type: string
 *                   description: Node.js version
 *                 platform:
 *                   type: string
 *                   description: Platform information
 *                 uptime:
 *                   type: number
 *                   description: Application uptime in seconds
 *                 memoryUsage:
 *                   type: object
 *                   description: Memory usage information
 *                 environment:
 *                   type: string
 *                   description: Current environment
 *     tags:
 *       - Info
 */

export async function GET(_request: NextRequest) {
  const appInfo = {
    name: packageJson.name,
    version: packageJson.version,
    description: 'A Tiny Dashboard for Network UPS Tools',
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    repository: 'https://github.com/Brandawg93/PeaNUT',
  }

  return NextResponse.json(appInfo)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
