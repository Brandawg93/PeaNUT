import { NextRequest, NextResponse } from 'next/server'
import { DEVICE } from '@/common/types'

import { Nut } from '@/server/nut'

// api/v1/devices/[device]/commands
export async function GET(request: NextRequest, { params }: { params: any }) {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()

  const device = params.device
  const data = await nut.getCommands(device)
  try {
    await nut.close()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(`Device ${device} not found`, { status: 404 })
  }
}
