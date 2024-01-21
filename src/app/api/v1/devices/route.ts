import { NextRequest, NextResponse } from 'next/server'
import { VARS } from '@/common/types'

import { Nut } from '@/server/nut'

// api/v1/devices
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
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
