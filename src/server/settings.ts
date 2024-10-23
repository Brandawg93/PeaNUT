import fs from 'fs'
import path from 'path'
import { load, dump } from 'js-yaml'

const ISettings = {
  NUT_HOST: undefined,
  NUT_PORT: 3493,
  WEB_HOST: 'localhost',
  WEB_PORT: 8080,
  USERNAME: undefined,
  PASSWORD: undefined,
  INFLUX_HOST: undefined,
  INFLUX_TOKEN: undefined,
  INFLUX_ORG: undefined,
  INFLUX_BUCKET: undefined,
  INFLUX_INTERVAL: 10,
}

export class YamlSettings {
  private filePath: string
  private data: any

  constructor(filePath: string) {
    this.filePath = path.resolve(__dirname, filePath)
    this.data = {}
    this.load()
  }

  private load(): void {
    console.log('Loading settings from', this.filePath)
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true })
    if (fs.existsSync(this.filePath)) {
      const fileContents = fs.readFileSync(this.filePath, 'utf8')
      this.data = load(fileContents)
    }
  }

  private loadFromEnvVars(): void {
    for (const key of Object.keys(ISettings)) {
      if (!this.data[key] && process.env[key]) {
        const eVar = key as keyof typeof ISettings
        if (typeof ISettings[eVar] === 'number') {
          this.data[key] = parseInt(process.env[key], 10)
        } else {
          this.data[key] = process.env[key]
        }
      }
    }
  }

  private save(): void {
    const yamlStr = dump(this.data)
    fs.writeFileSync(this.filePath, yamlStr, 'utf8')
  }

  public initWithEnvVars(): void {
    this.loadFromEnvVars()
    this.save()
  }

  public get(key: string): any {
    return this.data[key]
  }

  public set(key: string, value: any): void {
    this.data[key] = value
    this.save()
  }

  public delete(key: string): void {
    delete this.data[key]
    this.save()
  }

  public getAll(): any {
    return this.data
  }
}
