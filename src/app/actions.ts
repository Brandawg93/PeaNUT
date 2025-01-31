'use server'

import InfluxWriter from '@/server/influxdb'
import { DEVICE, NotificationProviders, NotifierSettings } from '@/common/types'
import { Nut } from '@/server/nut'
import { YamlSettings, SettingsType } from '@/server/settings'
import { server, DeviceData, VarDescription } from '@/common/types'
import { Notifier } from '@/server/notifications/notifier'
import { NotifierFactory } from '@/server/notifications/notifier-factory'

const settingsFile = './config/settings.yml'

async function connect(): Promise<Array<Nut>> {
  const settings = new YamlSettings(settingsFile)
  return settings
    .get('NUT_SERVERS')
    .map((server: server) => new Nut(server.HOST, server.PORT, server.USERNAME, server.PASSWORD))
}

export async function testConnection(server: string, port: number) {
  const nut = new Nut(server, port)
  return await nut.testConnection()
}

export async function testInfluxConnection(host: string, token: string, org: string, bucket: string) {
  const influxdata = new InfluxWriter(host, token, org, bucket)
  return await influxdata.testConnection()
}

export async function getDevices(): Promise<DeviceData> {
  try {
    const nuts = await connect()
    const gridProps: Array<DEVICE> = []
    const devicePromises = nuts.map(async (nut) => {
      const devices = await nut.getDevices()
      const devicePromises = devices.map(async (device) => {
        const [data, rwVars, commands] = await Promise.all([
          nut.getData(device.name),
          nut.getRWVars(device.name),
          nut.getCommands(device.name),
        ])
        return {
          vars: data,
          rwVars,
          description: device.description === 'Description unavailable' ? '' : device.description,
          clients: [],
          commands,
          name: device.name,
        }
      })
      const resolvedDevices = await Promise.all(devicePromises)
      gridProps.push(...resolvedDevices)
    })
    await Promise.all(devicePromises)
    const deviceNames = new Set<string>()
    for (const device of gridProps) {
      if (deviceNames.has(device.name)) {
        throw new Error(`Duplicate device name found: ${device.name}`)
      }
      deviceNames.add(device.name)
    }
    return { devices: gridProps, updated: new Date(), error: undefined }
  } catch (e: any) {
    return { devices: undefined, updated: new Date(), error: e?.message || 'Unknown error' }
  }
}

export async function getAllVarDescriptions(device: string, params: string[]): Promise<VarDescription> {
  try {
    const nut = (await connect()).find((nut) => nut.deviceExists(device))
    const data: { [x: string]: string } = {}
    if (!nut) {
      return { data: undefined, error: 'Device not found' }
    }
    const descriptions = await Promise.all(params.map((param) => nut.getVarDescription(device, param)))
    params.forEach((param, index) => {
      data[param] = descriptions[index]
    })
    return { data, error: undefined }
  } catch (e: any) {
    return { data: undefined, error: e?.message || 'Unknown error' }
  }
}

export async function saveVar(device: string, varName: string, value: string) {
  try {
    const nuts = await connect()
    const savePromises = nuts.map(async (nut) => {
      const deviceExists = await nut.deviceExists(device)
      if (deviceExists) {
        await nut.setVar(device, varName, value)
      }
    })
    await Promise.all(savePromises)
    return { error: undefined }
  } catch (e: any) {
    return { error: e?.message || 'Unknown error' }
  }
}

export async function getAllCommands(device: string): Promise<string[]> {
  try {
    const nuts = await connect()
    const commands = new Set<string>()
    const commandPromises = nuts.map(async (nut) => {
      const deviceExists = await nut.deviceExists(device)
      if (deviceExists) {
        const deviceCommands = await nut.getCommands(device)
        deviceCommands.forEach((command) => commands.add(command))
      }
    })
    await Promise.all(commandPromises)
    return Array.from(commands)
  } catch {
    return []
  }
}

export async function runCommand(device: string, command: string) {
  try {
    const nuts = await connect()
    const runPromises = nuts.map(async (nut) => {
      const deviceExists = await nut.deviceExists(device)
      if (deviceExists) {
        await nut.runCommand(device, command)
      }
    })
    await Promise.all(runPromises)
    return { error: undefined }
  } catch (e: any) {
    return { error: e?.message || 'Unknown error' }
  }
}

export async function checkSettings(): Promise<boolean> {
  const settings = new YamlSettings(settingsFile)
  return !!(settings.get('NUT_SERVERS').length > 0)
}

export async function getSettings<K extends keyof SettingsType>(key: K): Promise<SettingsType[K]> {
  const settings = new YamlSettings(settingsFile)
  return settings.get(key)
}

export async function setSettings<K extends keyof SettingsType>(key: K, value: SettingsType[K]): Promise<void> {
  const settings = new YamlSettings(settingsFile)
  settings.set(key, value)
}

export async function exportSettings(): Promise<string> {
  const settings = new YamlSettings(settingsFile)
  return settings.export()
}

export async function importSettings(settings: string): Promise<void> {
  const yamlSettings = new YamlSettings(settingsFile)
  yamlSettings.import(settings)
}

export async function updateServers(servers: Array<server>) {
  const settings = new YamlSettings(settingsFile)

  settings.set('NUT_SERVERS', servers)
}

export async function testNotificationProvider(
  name: (typeof NotificationProviders)[number],
  config: { [x: string]: string } | undefined
) {
  const notificationProvider: Notifier = NotifierFactory({ name, triggers: [], config })
  return await notificationProvider.sendTestNotification()
}

export async function updateNotificationProviders(notificationProviders: Array<NotifierSettings>) {
  const settings = new YamlSettings(settingsFile)
  settings.set('NOTIFICATION_PROVIDERS', notificationProviders)
}

export async function deleteSettings(key: keyof SettingsType) {
  const settings = new YamlSettings(settingsFile)
  settings.delete(key)
}

export async function disconnect() {
  const settings = new YamlSettings(settingsFile)
  settings.delete('NUT_SERVERS')
  settings.delete('INFLUX_HOST')
  settings.delete('INFLUX_TOKEN')
  settings.delete('INFLUX_ORG')
  settings.delete('INFLUX_BUCKET')
}
