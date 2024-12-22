import { NextRequest, NextResponse } from 'next/server'
import { getSingleNutInstance } from '@/app/api/utils'

type Params = {
  device: string
  param: string
}

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
export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { device, param } = await params
  const nut = await getSingleNutInstance(device)

  try {
    const deviceExists = await nut?.deviceExists(device)
    if (!deviceExists) {
      return NextResponse.json(`Device ${device} not found on any instance`, { status: 404 })
    }

    // Only save the variable on the first instance that has the device
    await nut?.runCommand(device, param)
    return NextResponse.json(`Command ${param} on device ${device} run successfully on device ${device}`)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Failed to run command ${param} on device ${device}`, {
      status: 500,
    })
  }
}
