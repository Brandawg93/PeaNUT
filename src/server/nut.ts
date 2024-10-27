import { DEVICE, VARS } from '@/common/types'
import PromiseSocket from '@/server/promise-socket'

export class Nut {
  private host: string

  private port: number

  private username: string

  private password: string

  constructor(host: string, port: number, username?: string, password?: string) {
    this.host = host
    this.port = port
    this.username = username || ''
    this.password = password || ''
  }

  private parseInfo(data: string, start: string, callback: (line: string) => string): Array<string> {
    return data
      .split('\n')
      .filter((line) => line.startsWith(start))
      .map((line) => callback(line))
  }

  private async getCommand(command: string, until?: string, checkCredentials = false): Promise<string> {
    const socket = new PromiseSocket()
    await socket.connect(this.port, this.host)
    if (checkCredentials) {
      await this.checkCredentials(socket)
    }
    await socket.write(command)
    const data = await socket.readAll(command, until)
    await socket.write('LOGOUT')
    await socket.close()
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

  public async testConnection(): Promise<boolean> {
    return await !!this.getCommand('LIST UPS')
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
    const command = `LIST VAR ${device}`
    const data = await this.getCommand(command)
    if (!data.startsWith(`BEGIN ${command}\n`)) {
      console.log('data: ', data)
      throw new Error('Invalid response')
    }
    const vars: VARS = {}
    const lines = data.split('\n').filter((line) => line.startsWith('VAR'))
    const promises = lines.map(async (line) => {
      const key = line.split('"')[0].replace(`VAR ${device} `, '').trim()
      const value = line.split('"')[1].trim()
      const type = await this.getType(device, key)
      if (type.includes('NUMBER') && !isNaN(+value)) {
        const num = +value
        vars[key] = { value: num ? num : value }
      } else {
        vars[key] = { value }
      }
    })
    await Promise.all(promises)
    return Object.keys(vars)
      .sort()
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

  public async getVar(device = 'UPS', variable: string): Promise<string> {
    const data = await this.getCommand(`GET VAR ${device} ${variable}`, '\n')
    if (!data.startsWith('VAR')) {
      throw new Error('Invalid response')
    }
    return data.split('"')[1].trim()
  }

  public async getVarDescription(device = 'UPS', variable: string): Promise<string> {
    const data = await this.getCommand(`GET DESC ${device} ${variable}`, '\n')
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

  public async getType(device = 'UPS', variable: string): Promise<string> {
    const data = await this.getCommand(`GET TYPE ${device} ${variable}`, '\n')
    if (!data.startsWith('TYPE')) {
      throw new Error('Invalid response')
    }
    return data.split(`TYPE ${device} ${variable}`)[1].trim()
  }

  public async setVar(device = 'UPS', variable: string, value: string): Promise<void> {
    const data = await this.getCommand(`SET VAR ${device} ${variable} ${value}`, '\n', true)
    if (data !== 'OK\n') {
      throw new Error('Invalid response')
    }
  }
}
