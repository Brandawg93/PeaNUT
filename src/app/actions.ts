'use server'

import { DEVICE } from '@/common/types'
import { Nut } from '@/server/nut'
import { YamlSettings } from '@/server/settings'

const settingsFile = './config/settings.yml'

async function connect() {
  const settings = new YamlSettings(settingsFile)
  const nut = new Nut(
    settings.get('NUT_HOST'),
    settings.get('NUT_PORT'),
    settings.get('USERNAME'),
    settings.get('PASSWORD')
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

export async function checkSettings() {
  const settings = new YamlSettings(settingsFile)
  return !!settings.get('NUT_HOST')
}

export async function getSettings(key: string) {
  const settings = new YamlSettings(settingsFile)
  return settings.get(key)
}

export async function setSettings(key: string, value: any) {
  const settings = new YamlSettings(settingsFile)
  settings.set(key, value)
}

export async function deleteSettings(key: string) {
  const settings = new YamlSettings(settingsFile)
  settings.delete(key)
}
