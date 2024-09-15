import { NextRequest, NextResponse } from 'next/server'

import { Nut } from '@/server/nut'

/**
 * Retrieves data for a specific device.
 *
 * @swagger
 * /api/v1/devices/{device}:
 *   get:
 *     summary: Retrieve device data
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         description: The ID of the device
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with device data
 *       '404':
 *         description: Device not found
 *     tags:
 *       - Devices
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
  try {
    const data = await nut.getData(device)
    const ret: any = {}
    Object.keys(data).forEach(function (key) {
      ret[key] = data[key].value
    })
    await nut.close()
    return NextResponse.json(ret)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
}
