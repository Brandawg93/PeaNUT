import { NextRequest } from 'next/server'
import { handleDeviceOperation } from '@/app/api/utils'

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ device: string }> }) {
  const { device } = await params
  return handleDeviceOperation(device, async (nut) => {
    return await nut.getRWVars(device)
  })
}
