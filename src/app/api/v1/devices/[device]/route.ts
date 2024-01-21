import { NextRequest, NextResponse } from 'next/server'

import { Nut } from '@/server/nut'

// api/v1/devices/[device]
export async function GET(request: NextRequest, { params }: { params: any }) {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()
  const device = params.device
  try {
    const data = await nut.getData(device)
    const ret: any = {}
    Object.keys(data).forEach(function (key) {
      ret[key] = data[key].value
    })
    await nut.close()
    return NextResponse.json(ret)
  } catch (e) {
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
}
