import { NextRequest } from 'next/server'
import { handleDeviceOperation } from '@/app/api/utils'
import { getCachedCommandDescription } from '@/server/nut-cache'

/**
 * Retrieves description for a specific command.
 *
 * @swagger
 * /api/v1/devices/{device}/command/{param}/description:
 *   get:
 *     summary: Retrieve command description
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         description: The ID of the device
 *         schema:
 *           type: string
 *       - in: path
 *         name: param
 *         required: true
 *         description: The key of the param
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with command description
 *       '404':
 *         description: Var not found
 *     tags:
 *       - Devices
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ device: string; param: string }> }) {
  const { device, param } = await params
  return handleDeviceOperation(device, async (nut, deviceName) => {
    return await getCachedCommandDescription(nut.getHost(), nut.getPort(), param, deviceName)
  })
}
