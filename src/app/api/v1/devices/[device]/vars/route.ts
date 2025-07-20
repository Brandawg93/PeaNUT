import { NextRequest } from 'next/server'
import { handleDeviceOperation } from '@/app/api/utils'

/**
 * Retrieves data for a specific device.
 *
 * @swagger
 * /api/v1/devices/{device}/vars:
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
 *       - Vars
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ device: string }> }) {
  const { device } = await params
  return handleDeviceOperation(device, async (nut) => {
    const varsData = await nut.getData(device)
    // Return just the values instead of the full VAR objects
    const varsValues: Record<string, string | number> = {}
    for (const [key, varData] of Object.entries(varsData)) {
      varsValues[key] = varData.value
    }
    return varsValues
  })
}
