import { NextRequest } from 'next/server'
import { handleDeviceOperation, successfulOperationMessage } from '@/app/api/utils'

/**
 * Saves value for a specific var.
 *
 * @swagger
 * /api/v1/devices/{device}/command/{param}:
 *   post:
 *     summary: Run command on device
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
 *         description: The command to run
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with command run
 *       '500':
 *         description: Failed to run command
 *     tags:
 *       - Devices
 */

export async function POST(request: NextRequest, { params }: { params: Promise<{ device: string; param: string }> }) {
  const { device, param } = await params
  return handleDeviceOperation(device, async (nut) => {
    await nut.runCommand(param, device)
    return successfulOperationMessage('Command', param, device)
  })
}
