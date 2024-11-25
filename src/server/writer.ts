import { YamlSettings } from './settings'
import { getDevices } from '@/app/actions'
import InfluxWriter from './influxdb'

const settingsFile = './config/settings.yml'

export default class Writer {
  private settings: YamlSettings
  private interval: NodeJS.Timeout | undefined

  constructor() {
    this.settings = new YamlSettings(settingsFile)
    this.settings.initWithEnvVars()
  }

  isWriting(): boolean {
    return !!this.interval
  }

  async start() {
    if (this.interval) {
      return
    }
    this.settings = new YamlSettings(settingsFile)
    const influxHost = this.settings.get('INFLUX_HOST')
    const influxToken = this.settings.get('INFLUX_TOKEN')
    const influxOrg = this.settings.get('INFLUX_ORG')
    const influxBucket = this.settings.get('INFLUX_BUCKET')
    const influxInterval = this.settings.get('INFLUX_INTERVAL') || 10

    if (influxHost && influxToken && influxOrg && influxBucket) {
      if (this.interval) {
        await this.stop()
      }
      this.interval = setInterval(async () => {
        const { devices } = await getDevices()
        try {
          const influxdata = new InfluxWriter(influxHost, influxToken, influxOrg, influxBucket)
          const writePromises = (devices || []).map((device) => influxdata.writePoint(device, new Date()))
          await Promise.all(writePromises)
          await influxdata.close()
        } catch (error) {
          console.error('Error writing to InfluxDB:', error)
        }
      }, influxInterval * 1000)
    } else {
      await this.stop()
    }
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }
  }
}
