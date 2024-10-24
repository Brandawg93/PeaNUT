import { NextRequest, NextResponse } from 'next/server'

import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'

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
  const NUT_HOST = await getSettings('NUT_HOST')
  const NUT_PORT = await getSettings('NUT_PORT')
  const USERNAME = await getSettings('USERNAME')
  const PASSWORD = await getSettings('PASSWORD')
  const nut = new Nut(NUT_HOST, NUT_PORT, USERNAME, PASSWORD)
  const { device } = await params
  try {
    const data = await nut.getData(device)
    const ret: any = {}
    Object.keys(data).forEach(function (key) {
      ret[key] = data[key].value
    })
    return NextResponse.json(ret)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
}
