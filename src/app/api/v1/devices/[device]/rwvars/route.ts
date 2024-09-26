import { NextRequest, NextResponse } from 'next/server'

import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'

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
export async function GET(request: NextRequest, { params }: { params: any }) {
  const NUT_HOST = await getSettings('NUT_HOST')
  const NUT_PORT = await getSettings('NUT_PORT')
  const USERNAME = await getSettings('USERNAME')
  const PASSWORD = await getSettings('PASSWORD')
  const nut = new Nut(NUT_HOST, NUT_PORT, USERNAME, PASSWORD)
  await nut.connect()

  const device = params.device
  const data = await nut.getRWVars(device)
  try {
    await nut.close()
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
}
