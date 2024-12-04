import { NextRequest, NextResponse } from 'next/server'
import { getSingleNutInstance } from '@/app/api/utils'

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
  const nut = await getSingleNutInstance(device)
  const data = await nut?.getCommands(device)
  if (data === undefined) {
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
  return NextResponse.json(data)
}
