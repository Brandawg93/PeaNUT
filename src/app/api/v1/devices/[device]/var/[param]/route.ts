import { NextRequest, NextResponse } from 'next/server'
import { DEVICE } from '@/common/types'
import { getSingleNutInstance } from '@/app/api/utils'

type Params = {
  device: string
  param: keyof DEVICE
}

/**
 * Retrieves value for a specific var.
 *
 * @swagger
 * /api/v1/devices/{device}/var/{param}:
 *   get:
 *     summary: Retrieve var data
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
 *         description: Successful response with var value
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
    const data = await nut?.getVar(param, device)
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Parameter ${paramString.toString()} on device ${device} not found`, { status: 404 })
  }
}

/**
 * Saves value for a specific var.
 *
 * @swagger
 * /api/v1/devices/{device}/var/{param}:
 *   post:
 *     summary: Save var data
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
 *     requestBody:
 *       description: The value to be saved
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       '200':
 *         description: Successful response with success message
 *       '500':
 *         description: Failed to save var
 *     tags:
 *       - Vars
 */
export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { device, param } = await params
  const nut = await getSingleNutInstance(device)
  const value = await request.text()

  try {
    const deviceExists = await nut?.deviceExists(device)
    if (!deviceExists) {
      return NextResponse.json(`Device ${device} not found on any instance`, { status: 404 })
    }

    // Only save the variable on the first instance that has the device
    await nut?.setVar(param, value, device)
    return NextResponse.json(`Variable ${param} on device ${device} saved successfully on device ${device}`)
  } catch (e) {
    console.error(e)
    return NextResponse.json(`Failed to save variable ${param} on device ${device}`, {
      status: 500,
    })
  }
}
