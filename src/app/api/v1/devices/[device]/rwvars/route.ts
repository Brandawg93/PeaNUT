import { NextRequest, NextResponse } from 'next/server'

import { Nut } from '@/server/nut'

/**
 * Retrieves writable vars for specific device.
 *
 * @swagger
 * /api/v1/devices/{device}/rwvars:
 *   get:
 *     summary: Retrieve writable vars
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         description: The ID of the device
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with writable vars
 *       '404':
 *         description: Device not found
 *     tags:
 *       - Vars
 */
export async function GET(request: NextRequest, { params }: { params: any }) {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()

  const device = params.device
  const data = await nut.getRWVars(device)
  try {
    await nut.close()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
}
