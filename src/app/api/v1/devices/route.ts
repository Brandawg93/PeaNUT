import { NextRequest, NextResponse } from 'next/server'
import { DEVICE } from '@/common/types'

import { Nut } from '@/server/nut'

// api/v1/devices
export async function GET() {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()

  const deviceData: Array<DEVICE> = []
  const devices = await nut.getDevices()
  const promises = devices.map((device) => nut.getData(device.name))
  for (const promise of promises) {
    const data = await promise
    deviceData.push(data)
  }
  await nut.close()
  return NextResponse.json(deviceData)
}
