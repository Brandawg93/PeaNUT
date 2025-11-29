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
import { parseDeviceId } from '@/lib/utils'
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
  if (settingsInstance) {
    debug.debug('Using cached settings instance')
  } else {
    debug.info('Creating new settings instance')
    settingsInstance = new YamlSettings(settingsFile)
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

// Validate that the host and port are present in the configured allow-list
function isAllowedNutServer(host: string, port: number): boolean {
  const settings = getCachedSettings()
  const servers = settings.get('NUT_SERVERS') || []
  return servers.some(
    (s: server) =>
      String(s.HOST).trim().toLowerCase() === String(host).trim().toLowerCase() &&
      Number(s.PORT) === Number(port) &&
      !s.DISABLED
  )
}

export async function testConnection(
  server: string,
  port: number,
  username?: string,
  password?: string
): Promise<string> {
  if (!isAllowedNutServer(server, port)) {
    throw new Error('Connection to this server is not allowed')
  }
  try {
    const nut = new Nut(server, port, username, password)
    const connection = await nut.testConnection()
    if (connection && username && password) {
      await nut.checkCredentials()
    }
    return connection
  } catch (error: any) {
    throw new Error(error.message)
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

        await Promise.all(
          devices.map(async (device) => {
            // Create composite device ID for unique identification across servers
            const deviceId = `${serverInfo}/${device.name}`

            // Skip if we already have this exact device (same server + name)
            if (deviceMap.has(deviceId)) {
              debug.debug('Skipping duplicate device', { device: device.name, server: serverInfo })
              return
            }

            // Add to order if not already present
            if (!deviceOrder.includes(deviceId)) {
              deviceOrder.push(deviceId)
            }

            debug.info('Processing device', { device: device.name, server: serverInfo, id: deviceId })
            const data = await nut.getData(device.name)
            const isReachable = data['ups.status']?.value !== upsStatus.DEVICE_UNREACHABLE

            debug.debug('Device reachability check', { device: device.name, isReachable })

            const [rwVars, commands] = await Promise.all([
              isReachable ? getCachedRWVars(nut.getHost(), nut.getPort(), device.name) : Promise.resolve([]),
              isReachable ? getCachedCommands(nut.getHost(), nut.getPort(), device.name) : Promise.resolve([]),
            ])

            deviceMap.set(deviceId, {
              id: deviceId,
              name: device.name,
              server: serverInfo,
              vars: data,
              rwVars,
              description: device.description === 'Description unavailable' ? '' : device.description,
              clients: [],
              commands: nut.hasCredentials() ? commands : [],
            })

            debug.info('Device processed successfully', { device: device.name, server: serverInfo, id: deviceId })
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
    devices: deviceOrder.map((id) => deviceMap.get(id)!),
    updated: new Date(),
    failedServers: failedServers.length > 0 ? failedServers : undefined,
  }

  debug.info('getDevices operation completed', {
    totalDevices: result.devices.length,
    failedServers: failedServers.length,
  })

  return result
}

export async function getDevice(deviceId: string): Promise<DeviceData> {
  const nuts = connect()
  const parsed = parseDeviceId(deviceId)
  let nut: Nut

  if (parsed.host && parsed.port) {
    // Composite ID format: find the specific server
    const matchingNut = nuts.find((n) => n.getHost() === parsed.host && n.getPort() === parsed.port)
    if (!matchingNut) {
      throw new Error('Server not found')
    }
    if (!(await matchingNut.deviceExists(parsed.name))) {
      throw new Error('Device not found on this server')
    }
    nut = matchingNut
  } else {
    // Legacy format: find any server that has the device (backward compatibility)
    nut = await Promise.any(
      nuts.map(async (n) => {
        if (await n.deviceExists(parsed.name)) {
          return n
        }
        throw new Error('Device not found on this server')
      })
    )
  }

  const serverInfo = `${nut.getHost()}:${nut.getPort()}`
  const compositeId = `${serverInfo}/${parsed.name}`

  const data = await nut.getData(parsed.name)
  const isReachable = data['ups.status']?.value !== upsStatus.DEVICE_UNREACHABLE

  const [rwVars, commands, description] = await Promise.all([
    isReachable ? getCachedRWVars(nut.getHost(), nut.getPort(), parsed.name) : Promise.resolve([]),
    isReachable ? getCachedCommands(nut.getHost(), nut.getPort(), parsed.name) : Promise.resolve([]),
    isReachable ? getCachedDeviceDescription(nut.getHost(), nut.getPort(), parsed.name) : Promise.resolve(''),
  ])
  return {
    device: {
      id: compositeId,
      name: parsed.name,
      server: serverInfo,
      vars: data,
      rwVars,
      description: description === 'Description unavailable' ? '' : description,
      clients: [],
      commands: nut.hasCredentials() ? commands : [],
    },
    updated: new Date(),
  }
}

export async function getAllVarDescriptions(deviceId: string, params: string[]): Promise<VarDescription> {
  try {
    const nuts = connect()
    const data: { [x: string]: string } = {}
    const parsed = parseDeviceId(deviceId)
    let nut: Nut

    if (parsed.host && parsed.port) {
      // Composite ID format: find the specific server
      const matchingNut = nuts.find((n) => n.getHost() === parsed.host && n.getPort() === parsed.port)
      if (!matchingNut || !(await matchingNut.deviceExists(parsed.name))) {
        throw new Error('Device not found')
      }
      nut = matchingNut
    } else {
      // Legacy format: find any server that has the device
      nut = await Promise.any(
        nuts.map(async (n) => {
          if (await n.deviceExists(parsed.name)) {
            return n
          }
          throw new Error('Device not found on this server')
        })
      )
    }

    const descriptions = await Promise.all(
      params.map((param) => getCachedVarDescription(nut.getHost(), nut.getPort(), param, parsed.name))
    )
    params.forEach((param, index) => {
      data[param] = descriptions[index]
    })
    return { data, error: undefined }
  } catch (e: any) {
    return { data: undefined, error: e?.message ?? 'Unknown error' }
  }
}

export async function saveVar(deviceId: string, varName: string, value: string) {
  try {
    const nuts = connect()
    const parsed = parseDeviceId(deviceId)

    if (parsed.host && parsed.port) {
      // Composite ID: target specific server
      const nut = nuts.find((n) => n.getHost() === parsed.host && n.getPort() === parsed.port)
      if (!nut || !(await nut.deviceExists(parsed.name))) {
        throw new Error('Device not found')
      }
      await nut.setVar(varName, value, parsed.name)
    } else {
      // Legacy format: apply to all servers that have the device
      await Promise.all(
        nuts.map(async (nut) => {
          const deviceExists = await nut.deviceExists(parsed.name)
          if (deviceExists) {
            await nut.setVar(varName, value, parsed.name)
          }
        })
      )
    }
    return { error: undefined }
  } catch (e: any) {
    return { error: e?.message ?? 'Unknown error' }
  }
}

export async function getAllCommands(deviceId: string): Promise<string[]> {
  try {
    const nuts = connect()
    const commands = new Set<string>()
    const parsed = parseDeviceId(deviceId)

    if (parsed.host && parsed.port) {
      // Composite ID: target specific server
      const nut = nuts.find((n) => n.getHost() === parsed.host && n.getPort() === parsed.port)
      if (nut && (await nut.deviceExists(parsed.name))) {
        const deviceCommands = await nut.getCommands(parsed.name)
        for (const command of deviceCommands) {
          commands.add(command)
        }
      }
    } else {
      // Legacy format: collect from all servers that have the device
      await Promise.all(
        nuts.map(async (nut) => {
          const deviceExists = await nut.deviceExists(parsed.name)
          if (deviceExists) {
            const deviceCommands = await nut.getCommands(parsed.name)
            for (const command of deviceCommands) {
              commands.add(command)
            }
          }
        })
      )
    }

    return Array.from(commands)
  } catch {
    return []
  }
}

export async function runCommand(deviceId: string, command: string) {
  try {
    const nuts = connect()
    const parsed = parseDeviceId(deviceId)

    if (parsed.host && parsed.port) {
      // Composite ID: target specific server
      const nut = nuts.find((n) => n.getHost() === parsed.host && n.getPort() === parsed.port)
      if (!nut || !(await nut.deviceExists(parsed.name))) {
        throw new Error('Device not found')
      }
      await nut.runCommand(command, parsed.name)
    } else {
      // Legacy format: run on all servers that have the device
      const runPromises = nuts.map(async (nut) => {
        const deviceExists = await nut.deviceExists(parsed.name)
        if (deviceExists) {
          await nut.runCommand(command, parsed.name)
        }
      })
      await Promise.all(runPromises)
    }
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

    for (const key of keysToDelete) {
      settings.delete(key)
    }
    settingsInstance = null // Reset cached instance
    await watcher.close() // Clean up the watcher
  } catch (e: any) {
    throw new Error(`Failed to disconnect: ${e.message}`)
  }
}
