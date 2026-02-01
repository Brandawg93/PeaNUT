import fs from 'node:fs'
import path from 'node:path'
import { load, dump } from 'js-yaml'
import { server } from '../common/types'
import { DEFAULT_INFLUX_INTERVAL } from '@/common/constants'
import { createDebugLogger } from '@/server/debug'

export type DashboardSectionKey = 'KPIS' | 'CHARTS' | 'VARIABLES'

export type DashboardSectionConfig = Array<{
  key: DashboardSectionKey
  enabled: boolean
}>

export type TemperatureUnit = 'celsius' | 'fahrenheit'

const ISettings = {
  NUT_SERVERS: [] as Array<server>,
  INFLUX_HOST: '',
  INFLUX_TOKEN: '',
  INFLUX_ORG: '',
  INFLUX_BUCKET: '',
  INFLUX_INTERVAL: DEFAULT_INFLUX_INTERVAL,
  DATE_FORMAT: 'MM/DD/YYYY',
  TIME_FORMAT: '12-hour',
  DASHBOARD_SECTIONS: [
    { key: 'KPIS', enabled: true },
    { key: 'CHARTS', enabled: true },
    { key: 'VARIABLES', enabled: true },
  ] as DashboardSectionConfig,
  DISABLE_VERSION_CHECK: false,
  TEMPERATURE_UNIT: 'celsius' as TemperatureUnit,
}

export type SettingsType = { [K in keyof typeof ISettings]: (typeof ISettings)[K] }

export class YamlSettings {
  private readonly filePath: string
  private data: SettingsType
  private readonly envVars: Record<string, string | undefined>
  private disableFileSaving: boolean
  private readonly debug: ReturnType<typeof createDebugLogger>

  constructor(filePath: string) {
    this.filePath = filePath
    this.data = { ...ISettings }
    // Cache environment variables
    this.envVars = { ...process.env }
    this.debug = createDebugLogger('SETTINGS')

    // Check if file saving should be disabled
    this.disableFileSaving = this.envVars.DISABLE_CONFIG_FILE === 'true'

    this.debug.info('Initializing YamlSettings', { filePath, disableFileSaving: this.disableFileSaving })
    this.loadFromEnvVars()
    this.load()
  }

  private loadFromEnvVars(): void {
    this.debug.info('Loading settings from environment variables')
    let key: keyof SettingsType
    for (key in ISettings) {
      const envValue = this.envVars[key]
      if (envValue === undefined || this.data[key] !== ISettings[key]) continue

      try {
        this.debug.debug('Processing environment variable', { key, hasValue: !!envValue })
        if (key === 'NUT_SERVERS') {
          this.data[key] = JSON.parse(envValue) as server[]
        } else if (key === 'DASHBOARD_SECTIONS') {
          this.data[key] = JSON.parse(envValue) as DashboardSectionConfig
        } else if (key === 'INFLUX_INTERVAL') {
          const parsed = Number(envValue)
          if (Number.isNaN(parsed)) throw new Error(`Invalid number for ${key}`)
          this.data[key] = parsed
        } else if (key === 'DISABLE_VERSION_CHECK') {
          this.data[key] = envValue === 'true'
        } else if (key === 'TEMPERATURE_UNIT') {
          this.data[key] = envValue === 'fahrenheit' ? 'fahrenheit' : 'celsius'
        } else {
          this.data[key] = envValue
        }
      } catch (error) {
        this.debug.error('Error parsing environment variable', {
          key,
          error: error instanceof Error ? error.message : String(error),
        })
        console.error(`Error parsing environment variable ${key}:`, error)
      }
    }

    // Backwards compatibility for NUT_HOST and NUT_PORT
    const { NUT_HOST: nutHost, NUT_PORT: nutPort, USERNAME: username, PASSWORD: password } = this.envVars

    if (nutHost && nutPort) {
      const port = Number(nutPort)
      if (Number.isNaN(port)) {
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
    this.debug.info('Loading settings from file', { filePath: this.filePath })
    // Create directory if it doesn't exist (only if file saving is enabled)
    if (!this.disableFileSaving) {
      try {
        const absolutePath = path.resolve(this.filePath)
        const dirPath = path.dirname(absolutePath)

        this.debug.debug('Checking directory permissions', { dirPath })
        // Check if directory exists first to avoid unnecessary mkdir calls
        if (fs.existsSync(dirPath)) {
          // Test if the directory is writable only if it already exists
          fs.accessSync(dirPath, fs.constants.W_OK)
        } else {
          this.debug.info('Creating config directory', { dirPath })
          fs.mkdirSync(dirPath, { recursive: true })
        }
      } catch (error) {
        this.debug.error('Config directory is not writable, disabling file saving', {
          error: error instanceof Error ? error.message : String(error),
        })
        console.error(
          'Config directory is not writable, disabling file saving:',
          error instanceof Error ? error.message : error
        )
        this.disableFileSaving = true
      }
    }

    try {
      if (fs.existsSync(this.filePath)) {
        this.debug.info('Loading settings from existing file')
        const fileContents = fs.readFileSync(this.filePath, 'utf8')
        const fileData = load(fileContents) as SettingsType
        // Merge settings, giving priority to file data
        this.data = { ...this.data, ...fileData }
        this.debug.info('Settings loaded successfully from file')
      } else if (!this.disableFileSaving) {
        this.debug.info('Settings file does not exist, creating new file')
        // Only try to save if file saving is enabled and the file doesn't exist
        this.save()
      }
    } catch (error) {
      this.debug.error('Error loading settings file', { error: error instanceof Error ? error.message : String(error) })
      console.error('Error loading settings file:', error instanceof Error ? error.message : error)
    }

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
      this.debug.debug('File saving is disabled, skipping save operation')
      return false
    }

    try {
      this.debug.info('Saving settings to file', { filePath: this.filePath })
      const yamlStr = dump(this.data)
      fs.writeFileSync(this.filePath, yamlStr, { encoding: 'utf8', mode: 0o600 })
      this.debug.info('Settings saved successfully')
      return true
    } catch (error) {
      this.debug.error('Error saving settings file', { error: error instanceof Error ? error.message : String(error) })
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
