import { upsStatus } from '@/common/constants'
import { DEVICE, VARS } from '@/common/types'
import PromiseSocket from '@/server/promise-socket'
import { createDebugLogger } from '@/server/debug'
import { getCachedVarDescription, getCachedVarType } from '@/server/nut-cache'

export class Nut {
  private readonly host: string

  private readonly port: number

  private readonly username: string

  private readonly password: string
  private readonly debug: ReturnType<typeof createDebugLogger>

  constructor(host: string, port: number, username?: string, password?: string) {
    this.host = host
    this.port = port
    this.username = username ?? ''
    this.password = password ?? ''
    this.debug = createDebugLogger('NUT')
  }

  public getHost(): string {
    return this.host
  }

  public getPort(): number {
    return this.port
  }

  public hasCredentials(): boolean {
    return !!this.username && !!this.password
  }

  private parseInfo(data: string, start: string, callback: (line: string) => string): Array<string> {
    return data
      .split('\n')
      .filter((line) => line.startsWith(start))
      .map((line) => callback(line))
  }

  public async deviceExists(device: string): Promise<boolean> {
    const devices = await this.getDevices()
    return devices.some((d) => d.name === device)
  }

  private async getConnection(checkCredentials = false): Promise<PromiseSocket> {
    this.debug.info('Attempting to establish connection', { host: this.host, port: this.port, checkCredentials })
    const socket = new PromiseSocket()
    try {
      await socket.connect(this.port, this.host)
      this.debug.info('Connection established successfully')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      this.debug.error('Connection failed', { host: this.host, port: this.port, error: message })
      throw new Error(`Connection failed: ${message}`)
    }
    if (checkCredentials) {
      this.debug.info('Checking credentials for connection')
      await this.checkCredentials(socket)
    }
    return socket
  }

  private async closeConnection(socket: PromiseSocket) {
    await socket.write('LOGOUT')
    await socket.close()
  }

  private async getCommand(
    command: string,
    until?: string,
    checkCredentials = false,
    socket?: PromiseSocket
  ): Promise<string> {
    this.debug.info('Executing command', { command, until, checkCredentials, hasSocket: !!socket })
    // use existing socket if it exists, otherwise establish a new connection
    const connection = socket ?? (await this.getConnection(checkCredentials))
    await connection.write(command)
    const data = await connection.readAll(command, until).catch((error) => {
      this.debug.warn('Command failed, handling fallback', { command, error: error.message })
      if (command.startsWith('LIST VAR')) {
        return upsStatus.DEVICE_UNREACHABLE
      }
      throw error
    })
    this.debug.debug('Command response received', { command, dataLength: data.length })
    // if we opened a new connection, close it
    if (!socket) {
      this.debug.debug('Closing temporary connection')
      await connection.write('LOGOUT')
      await connection.close()
    }
    return data
  }

  public async checkCredentials(socket?: PromiseSocket): Promise<void> {
    const connection = socket ?? (await this.getConnection())
    if (this.username) {
      const command = `USERNAME ${this.username}`
      await connection.write(command)
      const data = await connection.readAll(command, '\n')
      if (data !== 'OK\n') {
        throw new Error('Invalid username')
      }
    }

    if (this.password) {
      const command = `PASSWORD ${this.password}`
      await connection.write(command)
      const data = await connection.readAll(command, '\n')
      if (data !== 'OK\n') {
        throw new Error('Invalid password')
      }
    }

    const devices = await this.getDevices()
    if (devices.length === 0) {
      throw new Error('No devices found')
    }

    const device = devices[0].name
    const command = `LOGIN ${device}`
    await connection.write(command)

    const data = await connection.readAll(command, '\n')
    if (data !== 'OK\n') {
      throw new Error('Invalid credentials')
    }

    if (!socket) {
      await connection.write('LOGOUT')
      await connection.close()
    }
  }

  public async getVersion(): Promise<string> {
    const command = `VER`
    return (await this.getCommand(command, '\n')).replace('\n', '')
  }

  public async getNetVersion(): Promise<string> {
    const command = `NETVER`
    return (await this.getCommand(command, '\n')).replace('\n', '')
  }

  public async testConnection(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.getCommand('LIST UPS')
        .then(() => {
          resolve('Connection successful')
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error)
          console.error(message)
          reject(new Error(message))
        })
    })
  }

  public async getDevices(): Promise<Array<DEVICE>> {
    const command = 'LIST UPS'
    const devices: Array<DEVICE> = []
    const data = await this.getCommand(command)
    devices.push(
      ...data
        .split('\n')
        .filter((line) => line.startsWith('UPS'))
        .map((line) => {
          const [namePart, descriptionPart] = line.split('"')
          const name = namePart.replace('UPS ', '').trim()
          const description = descriptionPart.trim()
          return { name, description, rwVars: [], commands: [], clients: [], vars: {} }
        })
    )
    return devices
  }

  public async getData(device = 'UPS'): Promise<VARS> {
    const socket = await this.getConnection()
    const command = `LIST VAR ${device}`
    const data = await this.getCommand(command, undefined, false, socket)
    if (data == upsStatus.DEVICE_UNREACHABLE) {
      return {
        'ups.device_name': { value: device },
        'ups.status': { value: upsStatus.DEVICE_UNREACHABLE },
      }
    }
    if (!data.startsWith(`BEGIN ${command}\n`)) {
      console.error('data: ', data)
      throw new Error('Invalid response')
    }
    const vars: VARS = {}
    const lines = data.split('\n').filter((line) => line.startsWith('VAR'))
    for (const line of lines) {
      const key = line.split('"')[0].replace(`VAR ${device} `, '').trim()
      const value = line.split('"')[1].trim()
      const description = await getCachedVarDescription(this.host, this.port, key, device, socket)
      const type = await getCachedVarType(this.host, this.port, key, device, socket)
      if (type.includes('NUMBER') && !Number.isNaN(+value)) {
        const num = +value
        vars[key] = { value: num, description }
      } else {
        vars[key] = { value, description }
      }
    }
    await this.closeConnection(socket)
    return Object.keys(vars)
      .sort((a, b) => a.localeCompare(b))
      .reduce((finalObject: VARS, key) => {
        finalObject[key] = vars[key]
        return finalObject
      }, {})
  }

  public async getDescription(device = 'UPS'): Promise<string> {
    const command = `GET UPSDESC ${device}`
    const data = await this.getCommand(command, '\n')
    return data.split('"')[1].trim()
  }

  public async getCommands(device = 'UPS'): Promise<Array<string>> {
    const command = `LIST CMD ${device}`
    const data = await this.getCommand(command)
    const commands: Array<string> = this.parseInfo(data, 'CMD', (line) => line.replace(`CMD ${device} `, '').trim())
    return commands
  }

  public async getClients(device = 'UPS'): Promise<Array<string>> {
    const command = `LIST CLIENT ${device}`
    const data = await this.getCommand(command)
    const clients: Array<string> = this.parseInfo(data, 'CLIENT', (line) =>
      line.replace(`CLIENT ${device} `, '').trim()
    )
    return clients
  }

  public async getRWVars(device = 'UPS'): Promise<Array<keyof VARS>> {
    if (!this.username || !this.password) {
      return []
    }
    const command = `LIST RW ${device}`
    const data = await this.getCommand(command)
    const vars: Array<string> = this.parseInfo(data, 'RW', (line) =>
      line.split('"')[0].replace(`RW ${device} `, '').trim()
    )
    return vars
  }

  public async getCommandDescription(command: string, device = 'UPS'): Promise<string> {
    const data = await this.getCommand(`GET CMDDESC ${device} ${command}`, '\n')
    if (!data.startsWith('CMDDESC')) {
      throw new Error('Invalid response')
    }
    return data.split('"')[1].trim()
  }

  public async runCommand(command: string, device = 'UPS'): Promise<void> {
    const data = await this.getCommand(`INSTCMD ${device} ${command}`, '\n', true)
    if (data !== 'OK\n') {
      throw new Error('Invalid response')
    }
  }

  public async getVar(variable: string, device = 'UPS'): Promise<string> {
    const data = await this.getCommand(`GET VAR ${device} ${variable}`, '\n')
    if (!data.startsWith('VAR')) {
      throw new Error('Invalid response')
    }
    return data.split('"')[1].trim()
  }

  public async getVarDescription(variable: string, device = 'UPS', socket?: PromiseSocket): Promise<string> {
    try {
      const data = await this.getCommand(`GET DESC ${device} ${variable}`, '\n', false, socket)
      if (!data.startsWith('DESC')) {
        return 'Description unavailable'
      }
      return data.split('"')[1].trim()
    } catch {
      return 'Description unavailable'
    }
  }

  public async getEnum(variable: string, device = 'UPS'): Promise<Array<string>> {
    const command = `LIST ENUM ${device} ${variable}`
    const data = await this.getCommand(command)
    const enums: Array<string> = this.parseInfo(data, 'ENUM', (line) =>
      line.split('"')[1].replace(`ENUM ${device} `, '').trim()
    )
    return enums
  }

  public async getRange(variable: string, device = 'UPS'): Promise<Array<string>> {
    const command = `LIST RANGE ${device} ${variable}`
    const data = await this.getCommand(command)
    const ranges: Array<string> = this.parseInfo(data, 'RANGE', (line) =>
      line.split('"')[1].replace(`RANGE ${device} `, '').trim()
    )
    return ranges
  }

  public async getType(variable: string, device = 'UPS', socket?: PromiseSocket): Promise<string> {
    const data = await this.getCommand(`GET TYPE ${device} ${variable}`, '\n', false, socket)
    if (!data.startsWith('TYPE')) {
      throw new Error('Invalid response')
    }
    return data.split(`TYPE ${device} ${variable}`)[1].trim()
  }

  public async setVar(variable: string, value: string, device = 'UPS'): Promise<void> {
    if (await this.deviceExists(device)) {
      const data = await this.getCommand(`SET VAR ${device} ${variable} ${value}`, '\n', true)
      if (data !== 'OK\n') {
        throw new Error('Invalid response')
      }
    }
  }
}
