'use server'

import { DEVICE } from '@/common/types'
import { Nut } from '@/server/nut'
import { YamlSettings } from '@/server/settings'

const settingsFile = './config/settings.yml'

async function connect() {
  const settings = new YamlSettings(settingsFile)
  return new Nut(settings.get('NUT_HOST'), settings.get('NUT_PORT'), settings.get('USERNAME'), settings.get('PASSWORD'))
}

export async function testConnection(server: string, port: number) {
  const nut = new Nut(server, port)
  return await nut.testConnection()
}

export async function getDevices() {
  try {
    const nut = await connect()
    const gridProps: Array<DEVICE> = []
    const devices = await nut.getDevices()
    const devicePromises = devices.map(async (device) => {
      const [data, rwVars] = await Promise.all([nut.getData(device.name), nut.getRWVars(device.name)])
      return {
        vars: data,
        rwVars,
        description: device.description === 'Description unavailable' ? '' : device.description,
        clients: [],
        commands: [],
        name: device.name,
      }
    })
    const resolvedDevices = await Promise.all(devicePromises)
    gridProps.push(...resolvedDevices)
    return { devices: gridProps, updated: new Date(), error: undefined }
  } catch (e: any) {
    return { devices: undefined, updated: new Date(), error: e.message }
  }
}

export async function getAllVarDescriptions(device: string, params: string[]) {
  try {
    const nut = await connect()
    const data: { [x: string]: string } = {}
    const descriptions = await Promise.all(params.map((param) => nut.getVarDescription(device, param)))
    params.forEach((param, index) => {
      data[param] = descriptions[index]
    })
    return { data, error: undefined }
  } catch (e: any) {
    return { data: undefined, error: e.message }
  }
}

export async function saveVar(device: string, varName: string, value: string) {
  try {
    const nut = await connect()
    await nut.setVar(device, varName, value)
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function checkSettings(): Promise<boolean> {
  const settings = new YamlSettings(settingsFile)
  return !!(settings.get('NUT_HOST') && settings.get('NUT_PORT'))
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

export async function disconnect() {
  const settings = new YamlSettings(settingsFile)
  settings.delete('NUT_HOST')
  settings.delete('NUT_PORT')
  settings.delete('USERNAME')
  settings.delete('PASSWORD')
  settings.delete('INFLUX_HOST')
  settings.delete('INFLUX_TOKEN')
  settings.delete('INFLUX_ORG')
  settings.delete('INFLUX_BUCKET')
}
