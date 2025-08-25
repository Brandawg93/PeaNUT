import fs from 'fs'
import path from 'path'
import { load, dump } from 'js-yaml'
import { server, NotifierSettings } from '../common/types'
import { DEFAULT_INFLUX_INTERVAL, DEFAULT_NOTIFICATION_INTERVAL } from '@/common/constants'

export type DashboardSectionKey = 'KPIS' | 'CHARTS' | 'VARIABLES'

export type DashboardSectionConfig = Array<{
  key: DashboardSectionKey
  enabled: boolean
}>

const ISettings = {
  NUT_SERVERS: [] as Array<server>,
  INFLUX_HOST: '',
  INFLUX_TOKEN: '',
  INFLUX_ORG: '',
  INFLUX_BUCKET: '',
  INFLUX_INTERVAL: DEFAULT_INFLUX_INTERVAL,
  NOTIFICATION_INTERVAL: DEFAULT_NOTIFICATION_INTERVAL,
  NOTIFICATION_PROVIDERS: [] as Array<NotifierSettings>,
  DATE_FORMAT: 'MM/DD/YYYY',
  TIME_FORMAT: '12-hour',
  DASHBOARD_SECTIONS: [
    { key: 'KPIS', enabled: true },
    { key: 'CHARTS', enabled: true },
    { key: 'VARIABLES', enabled: true },
  ] as DashboardSectionConfig,
  DISABLE_VERSION_CHECK: false,
}

export type SettingsType = { [K in keyof typeof ISettings]: (typeof ISettings)[K] }

export class YamlSettings {
  private readonly filePath: string
  private data: SettingsType
  private readonly envVars: Record<string, string | undefined>
  private disableFileSaving: boolean

  constructor(filePath: string) {
    this.filePath = filePath
    this.data = { ...ISettings }
    // Cache environment variables
    this.envVars = { ...process.env }

    // Check if file saving should be disabled
    this.disableFileSaving = this.envVars.DISABLE_CONFIG_FILE === 'true'

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
        } else if (key === 'DASHBOARD_SECTIONS') {
          this.data[key] = JSON.parse(envValue) as DashboardSectionConfig
        } else if (key === 'INFLUX_INTERVAL' || key === 'NOTIFICATION_INTERVAL') {
          const parsed = Number(envValue)
          if (isNaN(parsed)) throw new Error(`Invalid number for ${key}`)
          this.data[key] = parsed
        } else if (key === 'DISABLE_VERSION_CHECK') {
          this.data[key] = envValue === 'true'
        } else {
          this.data[key] = envValue
        }
      } catch (error) {
        console.error(`Error parsing environment variable ${key}:`, error)
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
    // Create directory if it doesn't exist (only if file saving is enabled)
    if (!this.disableFileSaving) {
      try {
        const absolutePath = path.resolve(this.filePath)
        const dirPath = path.dirname(absolutePath)

        // Check if directory exists first to avoid unnecessary mkdir calls
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true })
        } else {
          // Test if the directory is writable only if it already exists
          fs.accessSync(dirPath, fs.constants.W_OK)
        }
      } catch (error) {
        console.error(
          'Config directory is not writable, disabling file saving:',
          error instanceof Error ? error.message : error
        )
        this.disableFileSaving = true
      }
    }

    try {
      if (fs.existsSync(this.filePath)) {
        const fileContents = fs.readFileSync(this.filePath, 'utf8')
        const fileData = load(fileContents) as SettingsType
        // Merge settings, giving priority to file data
        this.data = { ...this.data, ...fileData }
      } else if (!this.disableFileSaving) {
        // Only try to save if file saving is enabled and the file doesn't exist
        this.save()
      }
    } catch (error) {
      console.error('Error loading settings file:', error instanceof Error ? error.message : error)
    }
    this.data.NOTIFICATION_PROVIDERS ??= []

    // Ensure NUT_SERVERS is always an array using nullish coalescing
    this.data.NUT_SERVERS ??= []
    // Ensure DASHBOARD_SECTIONS has a default value
    this.data.DASHBOARD_SECTIONS ??= [
      { key: 'KPIS', enabled: true },
      { key: 'CHARTS', enabled: true },
      { key: 'VARIABLES', enabled: true },
    ]
  }

  private save(): boolean {
    if (this.disableFileSaving) {
      return false
    }

    try {
      const yamlStr = dump(this.data)
      fs.writeFileSync(this.filePath, yamlStr, 'utf8')
      return true
    } catch (error) {
      console.error('Error saving settings file:', error instanceof Error ? error.message : error)
      // Don't throw - allow the application to continue with environment variables
      return false
    }
  }

  public get<K extends keyof SettingsType>(key: K): SettingsType[K] {
    return this.data[key]
  }

  public set<K extends keyof SettingsType>(key: K, value: SettingsType[K]): boolean {
    this.data[key] = value
    return this.save()
  }

  public delete(key: keyof SettingsType): boolean {
    delete this.data[key]
    return this.save()
  }

  public getAll(): SettingsType {
    return this.data
  }

  public export(): string {
    return dump(this.data)
  }

  public import(contents: string): boolean {
    try {
      const fileData = load(contents) as SettingsType
      this.data = { ...ISettings, ...fileData }
      return this.save()
    } catch (error) {
      throw new Error(`Failed to import settings: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
