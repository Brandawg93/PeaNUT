import { NextRequest, NextResponse } from 'next/server'
import { getDeviceVariablesData, deviceNotFoundError } from '@/app/api/utils'

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
 *       - in: query
 *         name: meta
 *         required: false
 *         description: When true, includes PeaNUT-specific metadata in response
 *         schema:
 *           type: boolean
 *     responses:
 *       '200':
 *         description: Successful response with device data. When meta is enabled, includes `peanut.device_id` and `peanut.server`.
 *       '404':
 *         description: Device not found
 *     tags:
 *       - Devices
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ device: string }> }) {
  const { device } = await params
  try {
    const varsValues = await getDeviceVariablesData(device)

    const includeMeta = request.nextUrl.searchParams.get('meta') === 'true'

    if (includeMeta) {
      // Re-resolve the instance to get host:port
      const { getSingleNutInstance } = await import('@/app/api/utils')
      const result = await getSingleNutInstance(device)
      if (result) {
        const serverInfo = `${result.nut.getHost()}:${result.nut.getPort()}`
        return NextResponse.json({
          ...varsValues,
          'peanut.device_id': `${serverInfo}/${result.deviceName}`,
          'peanut.server': serverInfo,
        })
      }
    }

    return NextResponse.json(varsValues)
  } catch {
    return deviceNotFoundError()
  }
}
