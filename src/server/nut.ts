import { DEVICE, DEVICE_LIST } from '@/common/types'
import PromiseSocket from '@/server/promise-socket'

export class Nut {
  private socket: PromiseSocket

  private host: string

  private port: number

  private username: string

  private password: string

  constructor(host: string, port: number, username?: string, password?: string) {
    this.host = host
    this.port = port
    this.username = username || ''
    this.password = password || ''
    this.socket = new PromiseSocket()
  }

  private async getCommand(command: string, until?: string) {
    await this.socket.write(command)
    const data = await this.socket.readAll(command, until)
    if (data.startsWith('ERR')) {
      throw new Error('Invalid response')
    }
    return data
  }

  public async connect() {
    await this.socket.connect(this.port, this.host)

    if (this.username) {
      const res = await this.getCommand(`USERNAME ${this.username}`, '\n')
      if (res !== 'OK\n') {
        throw new Error('Invalid username')
      }
    }

    if (this.password) {
      const res = await this.getCommand(`PASSWORD ${this.password}`, '\n')
      if (res !== 'OK\n') {
        throw new Error('Invalid password')
      }
    }
  }

  public async close() {
    await this.socket.write('LOGOUT')
    await this.socket.close()
  }

  public async getDevices(): Promise<Array<DEVICE_LIST>> {
    const command = 'LIST UPS'
    const devices: Array<DEVICE_LIST> = []
    let data = await this.getCommand(command)
    for (const line of data.split('\n')) {
      if (line.startsWith('UPS')) {
        const name = line.split('"')[0].replace('UPS ', '').trim()
        const description = line.split('"')[1].trim()
        devices.push({ name, description })
      }
    }
    return devices
  }

  public async getData(device = 'UPS'): Promise<DEVICE> {
    const command = `LIST VAR ${device}`
    let data = await this.getCommand(command)
    if (!data.startsWith(`BEGIN ${command}\n`)) {
      throw new Error('Invalid response')
    }
    const deviceData: DEVICE = Object.assign(
      {},
      ...data.split('\n').map((line) => {
        if (line.startsWith('VAR')) {
          const key = line.split('"')[0].replace(`VAR ${device} `, '').trim()
          const value = line.split('"')[1].trim()
          return { [key]: value }
        }
      })
    )
    return deviceData
  }

  public async getDescription(device = 'UPS'): Promise<string> {
    const command = `GET UPSDESC ${device}`
    const data = await this.getCommand(command, '\n')
    return data.split('"')[1].trim()
  }

  public async getCommands(device = 'UPS'): Promise<Array<string>> {
    const command = `LIST CMD ${device}`
    const commands: Array<string> = []
    let data = await this.getCommand(command)
    for (const line of data.split('\n')) {
      if (line.startsWith('CMD')) {
        const command = line.split('"')[0].replace(`CMD ${device} `, '').trim()
        commands.push(command)
      }
    }

    return commands
  }

  public async getClients(device = 'UPS'): Promise<Array<string>> {
    const command = `LIST CLIENT ${device}`
    const clients: Array<string> = []
    let data = await this.getCommand(command)
    for (const line of data.split('\n')) {
      if (line.startsWith('CLIENT')) {
        const command = line.split('"')[0].replace(`CLIENT ${device} `, '').trim()
        clients.push(command)
      }
    }

    return clients
  }

  public async getRWVars(device = 'UPS'): Promise<Array<string>> {
    const command = `LIST RW ${device}`
    const vars: Array<string> = []
    let data = await this.getCommand(command)
    for (const line of data.split('\n')) {
      if (line.startsWith('RW')) {
        const command = line.split('"')[0].replace(`RW ${device} `, '').trim()
        vars.push(command)
      }
    }

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
}
