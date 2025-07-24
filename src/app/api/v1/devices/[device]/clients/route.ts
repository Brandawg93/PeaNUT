import { NextRequest } from 'next/server'
import { handleDeviceOperation } from '@/app/api/utils'

/**
 * Retrieves clients for a specific device.
 *
 * @swagger
 * /api/v1/devices/{device}/clients:
 *   get:
 *     summary: Retrieve device clients
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         description: The ID of the device
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with device clients
 *       '404':
 *         description: Device not found
 *     tags:
 *       - Devices
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ device: string }> }) {
  const { device } = await params
  return handleDeviceOperation(device, async (nut) => {
    return await nut.getClients(device)
  })
}
