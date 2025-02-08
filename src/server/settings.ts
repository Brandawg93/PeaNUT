import fs from 'fs'
import path from 'path'
import { load, dump } from 'js-yaml'
import { server, NotifierSettings } from '../common/types'
import { DEFAULT_INFLUX_INTERVAL } from '@/common/constants'

const ISettings = {
  NUT_SERVERS: [] as Array<server>,
  INFLUX_HOST: '',
  INFLUX_TOKEN: '',
  INFLUX_ORG: '',
  INFLUX_BUCKET: '',
  INFLUX_INTERVAL: DEFAULT_INFLUX_INTERVAL,
  NOTIFICATION_INTERVAL: 10,
  NOTIFICATION_PROVIDERS: [] as Array<NotifierSettings>,
}

export type SettingsType = { [K in keyof typeof ISettings]: (typeof ISettings)[K] }

export class YamlSettings {
  private readonly filePath: string
  private data: SettingsType
  private readonly envVars: Record<string, string | undefined>

  constructor(filePath: string) {
    this.filePath = filePath
    this.data = { ...ISettings }
    // Cache environment variables
    this.envVars = { ...process.env }
    this.loadFromEnvVars()
    this.load()
  }

  private loadFromEnvVars(): void {
    let key: keyof SettingsType
    for (key in ISettings) {
      const envValue = this.envVars[key]
      if (envValue === undefined || this.data[key] !== ISettings[key]) continue

      try {
        if (key === 'NUT_SERVERS') {
          this.data[key] = JSON.parse(envValue) as server[]
        } else if (key === 'NOTIFICATION_PROVIDERS') {
          this.data[key] = JSON.parse(envValue) as NotifierSettings[]
        } else if (key === 'INFLUX_INTERVAL' || key === 'NOTIFICATION_INTERVAL') {
          const parsed = Number(envValue)
          if (isNaN(parsed)) throw new Error(`Invalid number for ${key}`)
          this.data[key] = parsed
        } else {
          this.data[key] = envValue
        }
      } catch (error) {
        console.error(`Error parsing environment variable ${key}: ${error}`)
      }
    }

    // Backwards compatibility for NUT_HOST and NUT_PORT
    const { NUT_HOST: nutHost, NUT_PORT: nutPort, USERNAME: username, PASSWORD: password } = this.envVars

    if (nutHost && nutPort) {
      const port = Number(nutPort)
      if (isNaN(port)) {
        console.error('Invalid NUT_PORT value')
        return
      }

      const serverExists = this.data.NUT_SERVERS.some((server) => server.HOST === nutHost && server.PORT === port)

      if (!serverExists) {
        this.data.NUT_SERVERS.push({
          HOST: nutHost,
          PORT: port,
          USERNAME: username,
          PASSWORD: password,
        })
      }
    }
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
      console.error(`Error loading settings file: ${error instanceof Error ? error.message : error}`)
    }
    this.data.NOTIFICATION_PROVIDERS ??= []

    // Ensure NUT_SERVERS is always an array using nullish coalescing
    this.data.NUT_SERVERS ??= []
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

  public export(): string {
    return dump(this.data)
  }

  public import(contents: string): void {
    try {
      const fileData = load(contents) as SettingsType
      this.data = { ...ISettings, ...fileData }
      this.save()
    } catch (error) {
      throw new Error(`Failed to import settings: ${error instanceof Error ? error.message : error}`)
    }
  }
}
