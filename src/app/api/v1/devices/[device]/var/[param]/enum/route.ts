import { NextRequest, NextResponse } from 'next/server'
import { DEVICE } from '@/common/types'
import { getSingleNutInstance } from '@/app/api/utils'

type Params = {
  device: string
  param: keyof DEVICE
}

/**
 * Retrieves enum values for a specific var.
 *
 * @swagger
 * /api/v1/devices/{device}/var/{param}/enum:
 *   get:
 *     summary: Retrieve var enum values
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
 *         description: Successful response with var enum
 *       '404':
 *         description: Var not found
 *     tags:
 *       - Vars
 */
export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { device, param } = await params
  const nut = await getSingleNutInstance(device)
  const paramString = param
  const data = await nut?.getEnum(device, param)
  if (data === undefined) {
    return NextResponse.json(`Parameter ${paramString.toString()} not found`, {
      status: 404,
    })
  }
  return NextResponse.json(data)
}
