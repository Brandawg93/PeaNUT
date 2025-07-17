import { NextRequest, NextResponse } from 'next/server'
import { DEVICE } from '@/common/types'
import { getSingleNutInstance } from '@/app/api/utils'

type Params = {
  device: string
  param: keyof DEVICE
}

/**
 * Retrieves description for a specific var.
 *
 * @swagger
 * /api/v1/devices/{device}/var/{param}/description:
 *   get:
 *     summary: Retrieve var description
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
 *         description: Successful response with var description
 *       '404':
 *         description: Var not found
 *     tags:
 *       - Vars
 */
export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { device, param } = await params
  const nut = await getSingleNutInstance(device)
  const paramString = param
  try {
    const data = await nut?.getVarDescription(param, device)
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Parameter ${paramString.toString()} on device ${device} not found`, { status: 404 })
  }
}
