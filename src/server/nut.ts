import { DEVICE, VARS } from '@/common/types'
import PromiseSocket from '@/server/promise-socket'

export class Nut {
  private readonly host: string

  private readonly port: number

  private readonly username: string

  private readonly password: string

  constructor(host: string, port: number, username?: string, password?: string) {
    this.host = host
    this.port = port
    this.username = username ?? ''
    this.password = password ?? ''
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
    const socket = new PromiseSocket()
    try {
      await socket.connect(this.port, this.host)
    } catch (e: any) {
      return Promise.reject(new Error(`Connection failed: ${e.message}`))
    }
    if (checkCredentials) {
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
    // use existing socket if it exists, otherwise establish a new connection
    const connection = socket || (await this.getConnection(checkCredentials))
    await connection.write(command)
    const data = await connection.readAll(command, until)
    // if we opened a new connection, close it
    if (!socket) {
      await connection.write('LOGOUT')
      await connection.close()
    }
    if (data.startsWith('ERR')) {
      throw new Error(`Invalid response: ${data}`)
    }
    return data
  }

  public async checkCredentials(socket: PromiseSocket): Promise<void> {
    if (this.username) {
      const command = `USERNAME ${this.username}`
      await socket.write(command)
      const data = await socket.readAll(command, '\n')
      if (data !== 'OK\n') {
        throw new Error('Invalid username')
      }
    }

    if (this.password) {
      const command = `PASSWORD ${this.password}`
      await socket.write(command)
      const data = await socket.readAll(command, '\n')
      if (data !== 'OK\n') {
        throw new Error('Invalid password')
      }
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
        .catch((error: any) => {
          console.error(error?.message)
          reject(new Error(error?.message))
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
    if (!data.startsWith(`BEGIN ${command}\n`)) {
      console.log('data: ', data)
      throw new Error('Invalid response')
    }
    const vars: VARS = {}
    const lines = data.split('\n').filter((line) => line.startsWith('VAR'))
    for await (const line of lines) {
      const key = line.split('"')[0].replace(`VAR ${device} `, '').trim()
      const value = line.split('"')[1].trim()
      const description = await this.getVarDescription(device, key, socket)
      const type = await this.getType(device, key, socket)
      if (type.includes('NUMBER') && !isNaN(+value)) {
        const num = +value
        vars[key] = { value: num || value, description }
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
    if (!process.env.USERNAME || !process.env.PASSWORD) {
      return []
    }
    const command = `LIST RW ${device}`
    const data = await this.getCommand(command)
    const vars: Array<string> = this.parseInfo(data, 'RW', (line) =>
      line.split('"')[0].replace(`RW ${device} `, '').trim()
    )
    return vars
  }

  public async getCommandDescription(device = 'UPS', command: string): Promise<string> {
    const data = await this.getCommand(`GET CMDDESC ${device} ${command}`, '\n')
    if (!data.startsWith('CMDDESC')) {
      throw new Error('Invalid response')
    }
    return data.split('"')[1].trim()
  }

  public async runCommand(device = 'UPS', command: string): Promise<void> {
    const data = await this.getCommand(`INSTCMD ${device} ${command}`, '\n', true)
    if (data !== 'OK\n') {
      throw new Error('Invalid response')
    }
  }

  public async getVar(device = 'UPS', variable: string): Promise<string> {
    const data = await this.getCommand(`GET VAR ${device} ${variable}`, '\n')
    if (!data.startsWith('VAR')) {
      throw new Error('Invalid response')
    }
    return data.split('"')[1].trim()
  }

  public async getVarDescription(device = 'UPS', variable: string, socket?: PromiseSocket): Promise<string> {
    const data = await this.getCommand(`GET DESC ${device} ${variable}`, '\n', false, socket)
    if (!data.startsWith('DESC')) {
      throw new Error('Invalid response')
    }
    return data.split('"')[1].trim()
  }

  public async getEnum(device = 'UPS', variable: string): Promise<Array<string>> {
    const command = `LIST ENUM ${device} ${variable}`
    const data = await this.getCommand(command)
    const enums: Array<string> = this.parseInfo(data, 'ENUM', (line) =>
      line.split('"')[1].replace(`ENUM ${device} `, '').trim()
    )
    return enums
  }

  public async getRange(device = 'UPS', variable: string): Promise<Array<string>> {
    const command = `LIST RANGE ${device} ${variable}`
    const data = await this.getCommand(command)
    const ranges: Array<string> = this.parseInfo(data, 'RANGE', (line) =>
      line.split('"')[1].replace(`RANGE ${device} `, '').trim()
    )
    return ranges
  }

  public async getType(device = 'UPS', variable: string, socket?: PromiseSocket): Promise<string> {
    const data = await this.getCommand(`GET TYPE ${device} ${variable}`, '\n', false, socket)
    if (!data.startsWith('TYPE')) {
      throw new Error('Invalid response')
    }
    return data.split(`TYPE ${device} ${variable}`)[1].trim()
  }

  public async setVar(device = 'UPS', variable: string, value: string): Promise<void> {
    if (await this.deviceExists(device)) {
      const data = await this.getCommand(`SET VAR ${device} ${variable} ${value}`, '\n', true)
      if (data !== 'OK\n') {
        throw new Error('Invalid response')
      }
    }
  }
}
