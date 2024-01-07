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
  const gridProps: Array<DEVICE> = []
  const devices = await nut.getDevices()
  for (const device of devices) {
    const data = await nut.getData(device.name)
    const rwVars = await nut.getRWVars(device.name)
    gridProps.push({ vars: data, rwVars, description: '', clients: [], commands: [] })
  }
  await nut.close()
  return gridProps
}
