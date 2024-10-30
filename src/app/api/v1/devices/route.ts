import { NextRequest, NextResponse } from 'next/server'
import { getNutInstance } from '@/app/api/utils'

/**
 * Retrieves device data from the NUT server.
 *
 * @swagger
 * /api/v1/devices:
 *   get:
 *     summary: Retrieves data from all devices
 *     responses:
 *       '200':
 *         description: Successful response with device data
 *     tags:
 *       - Devices
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const nut = await getNutInstance()
  const deviceData: Array<Record<string, string | number>> = []
  const devices = await nut.getDevices()
  const deviceDataPromises = devices.map(async (device) => {
    const data = await nut.getData(device.name)
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.value]))
  })

  const resolvedDeviceData = await Promise.all(deviceDataPromises)
  deviceData.push(...resolvedDeviceData)
  return NextResponse.json(deviceData)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
