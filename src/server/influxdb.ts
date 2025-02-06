import { InfluxDB, Point, HttpError } from '@influxdata/influxdb-client'
import { PingAPI } from '@influxdata/influxdb-client-apis'
import { DEVICE } from '@/common/types'

export default class InfluxWriter {
  private readonly writeApi: ReturnType<InfluxDB['getWriteApi']>
  private readonly url: string
  private readonly token: string

  constructor(url: string, token: string, org: string, bucket: string) {
    this.url = url
    this.token = token
    this.writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 's')
  }

  async testConnection() {
    const influx = new InfluxDB({ url: this.url, token: this.token })
    const ping = new PingAPI(influx)
    return ping.getPing()
  }

  writePoint(device: DEVICE, timestamp?: Date | number) {
    // float fields
    for (const key of Object.keys(device.vars).filter((key) => typeof device.vars[key].value === 'number')) {
      const point = new Point(device.name)
        .tag('description', device.description)
        .floatField(key, device.vars[key].value)
      if (timestamp) {
        point.timestamp(timestamp)
      }

      this.writeApi.writePoint(point)
    }

    // string fields
    for (const key of Object.keys(device.vars).filter((key) => typeof device.vars[key].value === 'string')) {
      const point = new Point(device.name)
        .tag('description', device.description)
        .stringField(key, device.vars[key].value)
      if (timestamp) {
        point.timestamp(timestamp)
      }

      this.writeApi.writePoint(point)
    }
  }

  async close() {
    try {
      await this.writeApi.close()
    } catch (e) {
      console.error(e)
      if (e instanceof HttpError && e.statusCode === 401) {
        console.error('Could not connect to InfluxDB database.')
      }
    }
  }
}
