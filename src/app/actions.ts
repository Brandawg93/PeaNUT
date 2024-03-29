'use server'

import { DEVICE } from '@/common/types'
import { Nut } from '@/server/nut'

async function connect() {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD
  )
  await nut.connect()
  return nut
}

export async function getDevices() {
  try {
    const nut = await connect()
    const gridProps: Array<DEVICE> = []
    const devices = await nut.getDevices()
    for (const device of devices) {
      const data = await nut.getData(device.name)
      const rwVars = await nut.getRWVars(device.name)
      gridProps.push({
        vars: data,
        rwVars,
        description: device.description === 'Description unavailable' ? '' : device.description,
        clients: [],
        commands: [],
        name: device.name,
      })
    }
    await nut.close()
    return { devices: gridProps, updated: new Date(), error: undefined }
  } catch (e: any) {
    return { devices: undefined, updated: new Date(), error: e.message }
  }
}

export async function getAllVarDescriptions(device: string, params: string[]) {
  try {
    const nut = await connect()
    const data: { [x: string]: string } = {}
    for (const param of params) {
      const desc = await nut.getVarDescription(device, param)
      data[param] = desc
    }
    await nut.close()
    return { data, error: undefined }
  } catch (e: any) {
    return { data: undefined, error: e.message }
  }
}

export async function saveVar(device: string, varName: string, value: string) {
  try {
    const nut = await connect()
    await nut.setVar(device, varName, value)
    await nut.close()
  } catch (e: any) {
    return { error: e.message }
  }
}
