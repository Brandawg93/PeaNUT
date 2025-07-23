import { NextRequest } from 'next/server'
import { DEVICE } from '@/common/types'
import { handleVariableOperation, handleDeviceOperation, successfulOperationMessage } from '@/app/api/utils'

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
  return handleVariableOperation(device, param, async (nut) => {
    return await nut.getVar(param, device)
  })
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
  const value = await request.text()

  return handleDeviceOperation(device, async (nut) => {
    const deviceExists = await nut.deviceExists(device)
    if (!deviceExists) {
      throw new Error('Device not found on any instance')
    }

    await nut.setVar(param, value, device)
    return successfulOperationMessage('Variable', param, device)
  })
}
