import { InfluxDB, Point, HttpError } from '@influxdata/influxdb-client'
import { PingAPI } from '@influxdata/influxdb-client-apis'
import { DEVICE } from '@/common/types'
import { upsStatus } from '@/common/constants'
import { createDebugLogger } from '@/server/debug'

export default class InfluxWriter {
  private readonly writeApi: ReturnType<InfluxDB['getWriteApi']>
  private readonly url: string
  private readonly token: string
  private readonly debug: ReturnType<typeof createDebugLogger>

  constructor(url: string, token: string, org: string, bucket: string) {
    this.url = url
    this.token = token
    this.debug = createDebugLogger('INFLUXDB')
    this.writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 's')
    this.debug.info('InfluxWriter initialized', { url, org, bucket })
  }

  async testConnection() {
    this.debug.info('Testing InfluxDB connection')
    const influx = new InfluxDB({ url: this.url, token: this.token })
    const ping = new PingAPI(influx)
    try {
      const result = await ping.getPing()
      this.debug.info('InfluxDB connection test successful')
      return result
    } catch (error) {
      this.debug.error('InfluxDB connection test failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  writePoint(device: DEVICE, timestamp?: Date | number) {
    this.debug.debug('Writing device data to InfluxDB', { device: device.name, timestamp })

    // Skip writing if device is unreachable
    if (device.vars.status?.value === upsStatus.DEVICE_UNREACHABLE) {
      this.debug.debug('Skipping unreachable device', { device: device.name })
      return
    }

    let floatFieldCount = 0
    let stringFieldCount = 0

    for (const key of Object.keys(device.vars)) {
      const variable = device.vars[key]
      const value = variable.value

      if (typeof value !== 'number' && typeof value !== 'string') {
        continue
      }

      const point = new Point(device.name).tag('description', device.description).tag('server', device.server) // Server tag for multi-server disambiguation

      if (typeof value === 'number') {
        point.floatField(key, value)
      } else {
        point.stringField(key, value)
      }

      if (timestamp) {
        point.timestamp(timestamp)
      }

      try {
        this.writeApi.writePoint(point)
        if (typeof value === 'number') {
          floatFieldCount++
        } else {
          stringFieldCount++
        }
      } catch (e) {
        this.debug.error('Failed to write field', {
          device: device.name,
          field: key,
          error: e instanceof Error ? e.message : String(e),
        })
        console.error(`Failed to write field ${key} for device ${device.name}:`, e)
      }
    }

    this.debug.debug('Device data write completed', {
      device: device.name,
      floatFields: floatFieldCount,
      stringFields: stringFieldCount,
    })
  }

  async close() {
    this.debug.info('Closing InfluxDB write API')
    try {
      await this.writeApi.close()
      this.debug.info('InfluxDB write API closed successfully')
    } catch (e) {
      this.debug.error('Error closing InfluxDB write API', { error: e instanceof Error ? e.message : String(e) })
      console.error(e)
      if (e instanceof HttpError && e.statusCode === 401) {
        this.debug.error('Authentication failed when closing InfluxDB connection')
        console.error('Could not connect to InfluxDB database.')
      }
    }
  }
}
