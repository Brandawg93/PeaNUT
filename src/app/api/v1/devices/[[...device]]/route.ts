import { NextRequest, NextResponse } from 'next/server'

import { Nut } from '@/server/nut'

export async function GET(request: NextRequest, { params }: { params: any }) {
  if (params?.device?.length > 2) {
    return NextResponse.json('Only one device and/or parameter is supported', { status: 400 })
  }

  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()

  // api/v1/devices/[device]/[param]
  if (params?.device?.length === 2) {
    const device = params.device[0]
    const param = params.device[1]
    const paramString = param as keyof typeof data
    try {
      const data = await nut.getVar(device, param)
      await nut.close()
      if (data === undefined) {
        return NextResponse.json(`Parameter ${paramString.toString()} not found`, {
          status: 404,
        })
      }
      return NextResponse.json(data)
    } catch (e) {
      return NextResponse.json(`Parameter ${paramString.toString()} on device ${device} not found`, { status: 404 })
    }
  }

    // api/v1/devices/[device]
  if (params?.device?.length === 1) {
    const device = params.device[0]
    try {
      const data = await nut.getData(device)
      await nut.close()
      return NextResponse.json(data)
    } catch (e) {
      return NextResponse.json(`Device ${device} not found`, { status: 404 })
    }
  }
  
  // api/v1/devices
  const devices = await nut.getDevices()
  const promises = devices.map((device) => nut.getData(device.name))
  const data = await Promise.all(promises)
  await nut.close()
  return NextResponse.json(data)
}
