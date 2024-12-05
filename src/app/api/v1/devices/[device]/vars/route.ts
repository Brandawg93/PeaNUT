import { NextRequest, NextResponse } from 'next/server'
import { getSingleNutInstance } from '@/app/api/utils'

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
  const nut = await getSingleNutInstance(device)
  const data = await nut?.getData(device)
  if (data === undefined) {
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
  const ret = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.value]))
  return NextResponse.json(ret)
}
