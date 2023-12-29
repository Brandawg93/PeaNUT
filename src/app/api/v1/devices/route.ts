import { NextRequest, NextResponse } from 'next/server'
import { DEVICE } from '@/common/types'

import { Nut } from '@/server/nut'

// api/v1/devices
export async function GET(request: NextRequest) {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()

  const deviceData: Array<DEVICE> = []
  const devices = await nut.getDevices()
  for (const device of devices) {
    const data = await nut.getData(device.name)
    deviceData.push(data)
  }
  await nut.close()
  return NextResponse.json(deviceData)
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
