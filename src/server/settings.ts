import fs from 'fs'
import path from 'path'
import { load, dump } from 'js-yaml'
import { server } from '../common/types'

const ISettings = {
  NUT_SERVERS: [] as Array<server>,
  INFLUX_HOST: '',
  INFLUX_TOKEN: '',
  INFLUX_ORG: '',
  INFLUX_BUCKET: '',
  INFLUX_INTERVAL: 10,
}

export type SettingsType = { [K in keyof typeof ISettings]: (typeof ISettings)[K] }

export class YamlSettings {
  private filePath: string
  private data: SettingsType

  constructor(filePath: string) {
    this.filePath = filePath
    this.data = { ...ISettings }
    this.loadFromEnvVars()
    this.load()
  }

  private load(): void {
    // Create directory if it doesn't exist
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true })

    try {
      if (fs.existsSync(this.filePath)) {
        const fileContents = fs.readFileSync(this.filePath, 'utf8')
        const fileData = load(fileContents) as SettingsType
        // Merge settings, giving priority to file data
        this.data = { ...this.data, ...fileData }
      } else {
        this.save()
      }
    } catch (error) {
      console.error(`Error loading settings file: ${error}`)
    }

    // Ensure NUT_SERVERS is always an array
    this.data.NUT_SERVERS ??= []
  }

  private loadFromEnvVars(): void {
    let key: keyof SettingsType
    for (key in ISettings) {
      const envValue = process.env[key as string]
      if (envValue !== undefined && this.data[key] === ISettings[key]) {
        if (key === 'NUT_SERVERS') {
          this.data[key] = JSON.parse(envValue)
        } else if (key === 'INFLUX_INTERVAL') {
          this.data[key] = Number(envValue)
        } else {
          this.data[key] = envValue
        }
      }
    }

    // Backwards compatibility for NUT_HOST and NUT_PORT
    const nutHost = process.env.NUT_HOST
    const nutPort = process.env.NUT_PORT
    const username = process.env.USERNAME
    const password = process.env.PASSWORD
    if (nutHost && nutPort) {
      const existingServer = this.data.NUT_SERVERS.find(
        (server) => server.HOST === nutHost && server.PORT === Number(nutPort)
      )
      if (!existingServer) {
        this.data.NUT_SERVERS.push({
          HOST: nutHost,
          PORT: Number(nutPort),
          USERNAME: username,
          PASSWORD: password,
        })
      }
    }
  }

  private save(): void {
    const yamlStr = dump(this.data)
    fs.writeFileSync(this.filePath, yamlStr, 'utf8')
  }

  public get<K extends keyof SettingsType>(key: K): SettingsType[K] {
    return this.data[key]
  }

  public set<K extends keyof SettingsType>(key: K, value: SettingsType[K]): void {
    this.data[key] = value
    this.save()
  }

  public delete(key: keyof SettingsType): void {
    delete this.data[key]
    this.save()
  }

  public getAll(): SettingsType {
    return this.data
  }
}
