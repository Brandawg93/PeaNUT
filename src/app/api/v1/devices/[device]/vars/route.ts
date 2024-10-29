import { NextRequest, NextResponse } from 'next/server'
import { getNutInstance } from '@/app/api/utils'

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
export async function GET(request: NextRequest, { params }: { params: { device: string } }) {
  const nut = await getNutInstance()
  const { device } = await params
  try {
    const data = await nut.getData(device)
    const ret = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.value]))
    return NextResponse.json(ret)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
}
