'use server'

import InfluxWriter from './server/influxdb'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getDevices } = await import('./app/actions')
    const influxHost = process.env.INFLUX_HOST
    const influxToken = process.env.INFLUX_TOKEN
    const influxOrg = process.env.INFLUX_ORG
    const influxBucket = process.env.INFLUX_BUCKET
    const influxInterval = process.env.INFLUX_INTERVAL || '10'

    if (influxHost && influxToken && influxOrg && influxBucket) {
      setInterval(
        async () => {
          const { devices } = await getDevices()
          for (const device of devices || []) {
            const influxdata = new InfluxWriter(influxHost, influxToken, influxOrg, influxBucket)
            influxdata.writePoint(device, new Date())
            await influxdata.close()
          }
        },
        parseInt(influxInterval, 10) * 1000
      )
    }
  }
}
