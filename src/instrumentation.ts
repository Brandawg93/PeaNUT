'use server'

import InfluxWriter from './server/influxdb'

const settingsFile = './settings.yml'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Settings
    const { YamlSettings } = await import('./server/settings')
    const settings = new YamlSettings(settingsFile)
    settings.initWithEnvVars()

    // Influx data writer
    const { getDevices } = await import('./app/actions')
    const influxHost = settings.get('INFLUX_HOST')
    const influxToken = settings.get('INFLUX_TOKEN')
    const influxOrg = settings.get('INFLUX_ORG')
    const influxBucket = settings.get('INFLUX_BUCKET')
    const influxInterval = settings.get('INFLUX_INTERVAL')

    if (influxHost && influxToken && influxOrg && influxBucket) {
      setInterval(async () => {
        const { devices } = await getDevices()
        for (const device of devices || []) {
          const influxdata = new InfluxWriter(influxHost, influxToken, influxOrg, influxBucket)
          influxdata.writePoint(device, new Date())
          await influxdata.close()
        }
      }, influxInterval * 1000)
    }
  }
}
