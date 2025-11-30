import { NextRequest } from 'next/server'
import { handleDeviceOperation } from '@/app/api/utils'
import { getCachedCommands } from '@/server/nut-cache'

/**
 * Retrieves commands for a specific device.
 *
 * @swagger
 * /api/v1/devices/{device}/commands:
 *   get:
 *     summary: Retrieve device commands
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         description: The ID of the device
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with device commands
 *       '404':
 *         description: Device not found
 *     tags:
 *       - Devices
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ device: string }> }) {
  const { device } = await params
  return handleDeviceOperation(device, async (nut, deviceName) => {
    return await getCachedCommands(nut.getHost(), nut.getPort(), deviceName)
  })
}
