import { NextRequest, NextResponse } from 'next/server'
import { getNutInstances } from '@/app/api/utils'

/**
 * Retrieves device data from the NUT server.
 *
 * @swagger
 * /api/v1/devices:
 *   get:
 *     summary: Retrieves data from all devices
 *     parameters:
 *       - in: query
 *         name: meta
 *         required: false
 *         description: When true, includes PeaNUT-specific metadata in response
 *         schema:
 *           type: boolean
 *     responses:
 *       '200':
 *         description: Successful response with device data. When meta is enabled, each object includes `peanut.device_id` and `peanut.server`.
 *     tags:
 *       - Devices
 */

export async function GET(request: NextRequest) {
  const nutInstances = await getNutInstances()
  const deviceData: Array<Record<string, string | number>> = []

  const includeMeta = request.nextUrl.searchParams.get('meta') === 'true'

  const deviceDataPromises = nutInstances.map(async (nut) => {
    const devices = await nut.getDevices()
    const deviceDataPromises = devices.map(async (device) => {
      const data = await nut.getData(device.name)
      const flattened = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.value]))
      if (includeMeta) {
        return {
          ...flattened,
          'peanut.device_id': device.name,
          'peanut.server': `${nut.getHost()}:${nut.getPort()}`,
        }
      }
      return flattened
    })

    const resolvedDeviceData = await Promise.all(deviceDataPromises)
    return resolvedDeviceData
  })

  const resolvedDeviceDataArrays = await Promise.all(deviceDataPromises)
  resolvedDeviceDataArrays.forEach((dataArray) => deviceData.push(...dataArray))

  return NextResponse.json(deviceData)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
