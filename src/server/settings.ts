import fs from 'fs'
import path from 'path'
import { load, dump } from 'js-yaml'
import { server } from '../common/types'

const ISettings = {
  NUT_SERVERS: [] as Array<server>,
  WEB_HOST: 'localhost',
  WEB_PORT: 8080,
  INFLUX_HOST: undefined,
  INFLUX_TOKEN: undefined,
  INFLUX_ORG: undefined,
  INFLUX_BUCKET: undefined,
  INFLUX_INTERVAL: 10,
}

export class YamlSettings {
  private filePath: string
  private data: Partial<Record<keyof typeof ISettings, any>>

  constructor(filePath: string) {
    this.filePath = filePath
    this.data = {}
    this.load()
    this.initWithEnvVars()
  }

  public load(): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true })
    if (fs.existsSync(this.filePath)) {
      const fileContents = fs.readFileSync(this.filePath, 'utf8')
      this.data = load(fileContents) || {}
    }
  }

  private loadFromEnvVars(): void {
    for (const key in ISettings) {
      const envValue = process.env[key]
      if (envValue !== undefined && this.data[key as keyof typeof ISettings] === undefined) {
        const typedKey = key as keyof typeof ISettings
        if (typedKey === 'NUT_SERVERS') {
          this.data[typedKey] = JSON.parse(envValue)
        } else {
          this.data[typedKey] = typeof ISettings[typedKey] === 'number' ? Number(envValue) : envValue
        }
      }
    }

    // Backwards compatibility for NUT_HOST and NUT_PORT
    const nutHost = process.env.NUT_HOST
    const nutPort = process.env.NUT_PORT
    const username = process.env.USERNAME
    const password = process.env.PASSWORD
    if (nutHost && nutPort) {
      const existingServer = (this.data.NUT_SERVERS || []).find(
        (server: server) => server.HOST === nutHost && server.PORT === Number(nutPort)
      )
      if (!existingServer) {
        this.data.NUT_SERVERS = [
          ...(this.data.NUT_SERVERS || []),
          { HOST: nutHost, PORT: Number(nutPort), USERNAME: username, PASSWORD: password },
        ]
      }
    }
  }

  private save(): void {
    const yamlStr = dump(this.data)
    fs.writeFileSync(this.filePath, yamlStr, 'utf8')
  }

  private initWithEnvVars(): void {
    this.loadFromEnvVars()
    this.save()
  }

  public get(key: string): any {
    return this.data[key as keyof typeof ISettings]
  }

  public set(key: string, value: any): void {
    this.data[key as keyof typeof ISettings] = value
    this.save()
  }

  public delete(key: string): void {
    delete this.data[key as keyof typeof ISettings]
    this.save()
  }

  public getAll(): any {
    return this.data
  }
}
