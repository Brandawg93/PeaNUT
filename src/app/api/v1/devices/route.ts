import { NextRequest, NextResponse } from 'next/server'
import { VARS } from '@/common/types'

import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'

/**
 * Retrieves device data from the NUT server.
 *
 * @swagger
 * /api/v1/devices:
 *   get:
 *     summary: Retrieves data from all devices
 *     responses:
 *       '200':
 *         description: Successful response with device data
 *     tags:
 *       - Devices
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const NUT_HOST = await getSettings('NUT_HOST')
  const NUT_PORT = await getSettings('NUT_PORT')
  const USERNAME = await getSettings('USERNAME')
  const PASSWORD = await getSettings('PASSWORD')
  const nut = new Nut(NUT_HOST, NUT_PORT, USERNAME, PASSWORD)
  await nut.connect()

  const deviceData: Array<VARS> = []
  const devices = await nut.getDevices()
  for (const device of devices) {
    const data = await nut.getData(device.name)
    const ret: any = {}
    Object.keys(data).forEach(function (key) {
      ret[key] = data[key].value
    })
    deviceData.push(ret)
  }
  await nut.close()
  return NextResponse.json(deviceData)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
