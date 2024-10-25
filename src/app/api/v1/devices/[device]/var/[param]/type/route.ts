import { NextRequest, NextResponse } from 'next/server'
import { DEVICE } from '@/common/types'

import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'

/**
 * Retrieves type for a specific var.
 *
 * @swagger
 * /api/v1/devices/{device}/var/{param}/type:
 *   get:
 *     summary: Retrieve var type
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
 *         description: Successful response with var type
 *       '404':
 *         description: Var not found
 *     tags:
 *       - Vars
 */
export async function GET(request: NextRequest, { params }: { params: any }) {
  const NUT_HOST = await getSettings('NUT_HOST')
  const NUT_PORT = await getSettings('NUT_PORT')
  const USERNAME = await getSettings('USERNAME')
  const PASSWORD = await getSettings('PASSWORD')
  const nut = new Nut(NUT_HOST, NUT_PORT, USERNAME, PASSWORD)

  const { device, param } = await params
  const paramString = param as keyof DEVICE
  try {
    const data = await nut.getType(device, param)
    if (data === undefined) {
      return NextResponse.json(`Parameter ${paramString.toString()} not found`, {
        status: 404,
      })
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Parameter ${paramString.toString()} on device ${device} not found`, { status: 404 })
  }
}
