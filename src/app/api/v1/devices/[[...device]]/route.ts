import { NextRequest, NextResponse } from 'next/server'

import { Nut } from '@/server/connection/nut'

export async function GET(request: NextRequest, { params }: { params: any }) {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493', 10),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()
  const devices = await nut.getDevices()

  // api/v1/devices
  if (!params || !params.device || params.device.length === 0) {
    const promises = devices.map((device) => nut.getData(device))
    const data = await Promise.all(promises)
    await nut.close()
    return NextResponse.json(data)
  }

  if (params.device.length > 2) {
    return NextResponse.json('Only one device is supported', { status: 400 })
  }

  const device = params.device[0]
  if (!devices.includes(device)) {
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
  const data = await nut.getData(device)
  await nut.close()

  // api/v1/devices/[device]/[param]
  if (params.device.length === 2) {
    const paramString = params.device[1]
    const value = data[paramString]
    if (value === undefined) {
      return NextResponse.json(`Parameter ${paramString} not found`, {
        status: 404,
      })
    }
    return NextResponse.json(value)
  }

  // api/v1/devices/[device]
  return NextResponse.json(data)
}
