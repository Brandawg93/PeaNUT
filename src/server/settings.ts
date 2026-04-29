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
      const absolutePath = path.resolve(this.filePath)
      const dirPath = path.dirname(absolutePath)
      try {
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
        this.logConfigDirError(dirPath, error)
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

  private logConfigDirError(dirPath: string, error: unknown): void {
    const errMsg = error instanceof Error ? error.message : String(error)
    const lines: Array<string> = []
    lines.push('')
    lines.push('=========================================================================')
    lines.push('PeaNUT cannot write to the config directory.')
    lines.push('Settings changed in the web UI will NOT be saved and will be lost')
    lines.push('on restart. Servers added through the UI will disappear.')
    lines.push('')
    lines.push(`  Path:          ${dirPath}`)
    lines.push(`  Error:         ${errMsg}`)

    // process.getuid/getgid are Unix-only (undefined on Windows). Most PeaNUT
    // users hit this in Docker on Linux, so we report when available.
    const getuid = (process as NodeJS.Process & { getuid?: () => number }).getuid
    const getgid = (process as NodeJS.Process & { getgid?: () => number }).getgid
    if (typeof getuid === 'function' && typeof getgid === 'function') {
      lines.push(`  Process user:  uid=${getuid.call(process)} gid=${getgid.call(process)}`)
    }

    try {
      const stat = fs.statSync(dirPath)
      const mode = (stat.mode & 0o777).toString(8).padStart(3, '0')
      lines.push(`  Directory:     uid=${stat.uid} gid=${stat.gid} mode=${mode}`)
    } catch {
      // Directory doesn't exist or can't be stat'd — likely the parent isn't
      // writable either. Skip the directory line; the error above already
      // tells the user what happened.
    }

    lines.push('')
    lines.push('How to fix (Docker):')
    lines.push('  - Make the host directory owned by the container user, e.g.')
    lines.push('      chown -R 1000:1000 /path/to/host/config')
    lines.push('  - Or run the container as a user that owns the directory, e.g.')
    lines.push("      services.peanut.user: '1000:1000'   in docker-compose.yml")
    lines.push('  - Or set DISABLE_CONFIG_FILE=true to acknowledge env-only config')
    lines.push('    and silence this warning. Note: UI settings still will not persist.')
    lines.push('=========================================================================')
    lines.push('')

    console.error(lines.join('\n'))
  }

  public import(contents: string): boolean {
    try {
      const fileData = load(contents) as SettingsType
      this.data = { ...ISettings, ...fileData }
      return this.save()
    } catch (error) {
      throw new Error(`Failed to import settings: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      })
    }
  }
}
