import { NextRequest, NextResponse } from 'next/server'
import { getNutInstance } from '@/app/api/utils'

/**
 * Retrieves description for a specific device.
 *
 * @swagger
 * /api/v1/devices/{device}/description:
 *   get:
 *     summary: Retrieve device description
 *     parameters:
 *       - in: path
 *         name: device
 *         required: true
 *         description: The ID of the device
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with device description
 *       '404':
 *         description: Device not found
 *     tags:
 *       - Devices
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ device: any }> }) {
  const nut = await getNutInstance()
  const { device } = await params
  const data = await nut.getDescription(device)
  try {
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
}
