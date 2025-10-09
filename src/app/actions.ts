'use server'

import InfluxWriter from '@/server/influxdb'
import { Nut } from '@/server/nut'
import { YamlSettings, SettingsType } from '@/server/settings'
import { DEVICE, server, DeviceData, DevicesData, VarDescription } from '@/common/types'
import chokidar from 'chokidar'
import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/auth'
import { upsStatus } from '@/common/constants'
import { createDebugLogger } from '@/server/debug'
import {
  getCachedCommands,
  getCachedRWVars,
  getCachedDeviceDescription,
  getCachedVarDescription,
} from '@/server/nut-cache'

const settingsFile = './config/settings.yml'
const debug = createDebugLogger('ACTIONS')

// Cache settings instance
let settingsInstance: YamlSettings | null = null

// Initialize watcher
const watcher = chokidar.watch(settingsFile, {
  persistent: true,
  ignoreInitial: true,
})

// Reset settings instance when file changes
watcher.on('change', () => {
  debug.info('Settings file changed, resetting cache')
  settingsInstance = null
})

function getCachedSettings(): YamlSettings {
  if (!settingsInstance) {
    debug.info('Creating new settings instance')
    settingsInstance = new YamlSettings(settingsFile)
  } else {
    debug.debug('Using cached settings instance')
  }
  return settingsInstance
}

function connect(): Array<Nut> {
  try {
    debug.info('Connecting to NUT servers')
    const settings = getCachedSettings()
    const servers = settings.get('NUT_SERVERS')
    if (!Array.isArray(servers) || servers.length === 0) {
      debug.warn('No NUT servers configured')
      return []
    }
    const enabledServers = servers.filter((server: server) => !server.DISABLED)
    debug.info('Creating NUT connections', { serverCount: enabledServers.length })
    return enabledServers.map((server: server) => new Nut(server.HOST, server.PORT, server.USERNAME, server.PASSWORD))
  } catch (e: any) {
    debug.error('Failed to connect to NUT servers', { error: e.message })
    throw new Error(`Failed to connect to NUT servers: ${e.message}`)
  }
}

export async function testConnection(
  server: string,
  port: number,
  username?: string,
  password?: string
): Promise<string> {
  try {
    const nut = new Nut(server, port, username, password)
    const connection = await nut.testConnection()
    if (connection && username && password) {
      await nut.checkCredentials()
    }
    return connection
  } catch (error: any) {
    return Promise.reject(new Error(error.message))
  }
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message === 'CredentialsSignin') {
        return 'Invalid credentials.'
      }
      return 'Something went wrong.'
    }
    throw error
  }
}

export async function logout() {
  await signOut()
}

export async function testInfluxConnection(host: string, token: string, org: string, bucket: string) {
  const influxdata = new InfluxWriter(host, token, org, bucket)
  return await influxdata.testConnection()
}

export async function getDevices(): Promise<DevicesData> {
  debug.info('Starting getDevices operation')
  const nuts = connect()
  const deviceMap = new Map<string, DEVICE>()
  const deviceOrder: string[] = []
  const failedServers: string[] = []

  debug.info('Processing NUT servers', { serverCount: nuts.length })

  await Promise.all(
    nuts.map(async (nut) => {
      const serverInfo = `${nut.getHost()}:${nut.getPort()}`
      try {
        debug.info('Testing connection to server', { server: serverInfo })
        // Test connection first
        await nut.testConnection()

        debug.info('Getting devices from server', { server: serverInfo })
        const devices = await nut.getDevices()
        debug.info('Retrieved devices from server', { server: serverInfo, deviceCount: devices.length })

        devices.forEach((device) => {
          if (!deviceOrder.includes(device.name)) {
            deviceOrder.push(device.name)
          }
        })

        await Promise.all(
          devices.map(async (device) => {
            // Skip if we already have this device
            if (deviceMap.has(device.name)) {
              debug.debug('Skipping duplicate device', { device: device.name, server: serverInfo })
              return
            }

            debug.info('Processing device', { device: device.name, server: serverInfo })
            const data = await nut.getData(device.name)
            const isReachable = data['ups.status']?.value !== upsStatus.DEVICE_UNREACHABLE

            debug.debug('Device reachability check', { device: device.name, isReachable })

            const [rwVars, commands] = await Promise.all([
              isReachable ? getCachedRWVars(nut.getHost(), nut.getPort(), device.name) : Promise.resolve([]),
              isReachable ? getCachedCommands(nut.getHost(), nut.getPort(), device.name) : Promise.resolve([]),
            ])

            deviceMap.set(device.name, {
              vars: data,
              rwVars,
              description: device.description === 'Description unavailable' ? '' : device.description,
              clients: [],
              commands: nut.hasCredentials() ? commands : [],
              name: device.name,
            })

            debug.info('Device processed successfully', { device: device.name, server: serverInfo })
          })
        )
      } catch (error) {
        debug.error('Failed to process server', {
          server: serverInfo,
          error: error instanceof Error ? error.message : String(error),
        })
        // Add failed server to list
        failedServers.push(serverInfo)
      }
    })
  )

  const result = {
    devices: deviceOrder.map((name) => deviceMap.get(name)!),
    updated: new Date(),
    failedServers: failedServers.length > 0 ? failedServers : undefined,
  }

  debug.info('getDevices operation completed', {
    totalDevices: result.devices.length,
    failedServers: failedServers.length,
  })

  return result
}

export async function getDevice(device: string): Promise<DeviceData> {
  const nuts = connect()
  const nut = await Promise.any(
    nuts.map(async (nut) => {
      if (await nut.deviceExists(device)) {
        return nut
      }
      throw new Error('Device not found on this server')
    })
  )

  const data = await nut.getData(device)
  const isReachable = data['ups.status']?.value !== upsStatus.DEVICE_UNREACHABLE

  const [rwVars, commands, description] = await Promise.all([
    isReachable ? getCachedRWVars(nut.getHost(), nut.getPort(), device) : Promise.resolve([]),
    isReachable ? getCachedCommands(nut.getHost(), nut.getPort(), device) : Promise.resolve([]),
    isReachable ? getCachedDeviceDescription(nut.getHost(), nut.getPort(), device) : Promise.resolve(''),
  ])
  return {
    device: {
      vars: data,
      rwVars,
      description: description === 'Description unavailable' ? '' : description,
      clients: [],
      commands: nut.hasCredentials() ? commands : [],
      name: device,
    },
    updated: new Date(),
  }
}

export async function getAllVarDescriptions(device: string, params: string[]): Promise<VarDescription> {
  try {
    const nuts = connect()
    const data: { [x: string]: string } = {}

    // Find the first NUT server that has the device
    const nut = await Promise.any(
      nuts.map(async (nut) => {
        if (await nut.deviceExists(device)) {
          return nut
        }
        throw new Error('Device not found on this server')
      })
    )

    const descriptions = await Promise.all(
      params.map((param) => getCachedVarDescription(nut.getHost(), nut.getPort(), param, device))
    )
    params.forEach((param, index) => {
      data[param] = descriptions[index]
    })
    return { data, error: undefined }
  } catch (e: any) {
    return { data: undefined, error: e?.message ?? 'Unknown error' }
  }
}

export async function saveVar(device: string, varName: string, value: string) {
  try {
    const nuts = connect()
    await Promise.all(
      nuts.map(async (nut) => {
        const deviceExists = await nut.deviceExists(device)
        if (deviceExists) {
          await nut.setVar(varName, value, device)
        }
      })
    )
    return { error: undefined }
  } catch (e: any) {
    return { error: e?.message ?? 'Unknown error' }
  }
}

export async function getAllCommands(device: string): Promise<string[]> {
  try {
    const nuts = connect()
    const commands = new Set<string>()

    await Promise.all(
      nuts.map(async (nut) => {
        const deviceExists = await nut.deviceExists(device)
        if (deviceExists) {
          const deviceCommands = await nut.getCommands(device)
          deviceCommands.forEach((command) => commands.add(command))
        }
      })
    )

    return Array.from(commands)
  } catch {
    return []
  }
}

export async function runCommand(device: string, command: string) {
  try {
    const nuts = connect()
    const runPromises = nuts.map(async (nut) => {
      const deviceExists = await nut.deviceExists(device)
      if (deviceExists) {
        await nut.runCommand(command, device)
      }
    })
    await Promise.all(runPromises)
    return { error: undefined }
  } catch (e: any) {
    return { error: e?.message ?? 'Unknown error' }
  }
}

export async function checkSettings(): Promise<boolean> {
  try {
    const settings = getCachedSettings()
    const servers = settings.get('NUT_SERVERS')
    return Array.isArray(servers) && servers.length > 0
  } catch {
    return false
  }
}

export async function getSettings<K extends keyof SettingsType>(key: K): Promise<SettingsType[K]> {
  const settings = getCachedSettings()
  return settings.get(key)
}

export async function setSettings<K extends keyof SettingsType>(key: K, value: SettingsType[K]): Promise<void> {
  const settings = getCachedSettings()
  settings.set(key, value)
}

export async function exportSettings(): Promise<string> {
  const settings = getCachedSettings()
  return settings.export()
}

export async function importSettings(settings: string): Promise<void> {
  const yamlSettings = getCachedSettings()
  yamlSettings.import(settings)
}

export async function updateServers(servers: Array<server>) {
  const settings = getCachedSettings()

  settings.set('NUT_SERVERS', servers)
}

export async function deleteSettings(key: keyof SettingsType) {
  const settings = getCachedSettings()
  settings.delete(key)
}

export async function disconnect() {
  try {
    const settings = getCachedSettings()
    const keysToDelete: (keyof SettingsType)[] = [
      'NUT_SERVERS',
      'INFLUX_HOST',
      'INFLUX_TOKEN',
      'INFLUX_ORG',
      'INFLUX_BUCKET',
    ]

    keysToDelete.forEach((key) => settings.delete(key))
    settingsInstance = null // Reset cached instance
    await watcher.close() // Clean up the watcher
  } catch (e: any) {
    throw new Error(`Failed to disconnect: ${e.message}`)
  }
}
