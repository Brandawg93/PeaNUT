'use server'

import { DEVICE } from '@/common/types'
import { Nut } from '@/server/nut'

export async function getDevices() {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()
  const devices = await nut.getDevices()
  const promises = devices.map((device) => nut.getData(device.name))
  const data: Array<DEVICE> = await Promise.all(promises)
  await nut.close()
  return data
}
