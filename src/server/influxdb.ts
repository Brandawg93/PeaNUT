import { InfluxDB, Point, HttpError } from '@influxdata/influxdb-client'
import { PingAPI } from '@influxdata/influxdb-client-apis'
import { DEVICE } from '@/common/types'
import { upsStatus } from '@/common/constants'
import { createDebugLogger } from '@/server/debug'

export type HistoryPoint = {
  time: string
  value: number
}

// Cap on returned points per series regardless of range, so a wide range (or "all data")
// can't blow past what the InfluxDB proxy / chart can handle - mirrors the windowing a
// query tool like Grafana computes from panel width, which this codebase has no equivalent of.
const MAX_HISTORY_POINTS = 500
// timeRange of 0 means "all data" in the UI; there's no fixed span to derive a sensible
// aggregation window from, so assume a 30-day horizon purely for windowing purposes. The
// query's actual start is still the epoch, so nothing is excluded - it's just downsampled
// as if it were a 30-day range.
const ALL_DATA_ASSUMED_MINUTES = 30 * 24 * 60

function escapeFluxString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function aggregateWindowFor(rangeMinutes: number): string {
  const effectiveMinutes = rangeMinutes > 0 ? rangeMinutes : ALL_DATA_ASSUMED_MINUTES
  const secondsPerPoint = Math.max(10, Math.ceil((effectiveMinutes * 60) / MAX_HISTORY_POINTS))
  return `${secondsPerPoint}s`
}

export default class InfluxWriter {
  private readonly writeApi: ReturnType<InfluxDB['getWriteApi']>
  private readonly url: string
  private readonly token: string
  private readonly org: string
  private readonly bucket: string
  private readonly debug: ReturnType<typeof createDebugLogger>

  constructor(url: string, token: string, org: string, bucket: string) {
    this.url = url
    this.token = token
    this.org = org
    this.bucket = bucket
    this.debug = createDebugLogger('INFLUXDB')
    this.writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 's')
    this.debug.info('InfluxWriter initialized', { url, org, bucket })
  }

  // rangeMinutes <= 0 means "all data" (see ALL_DATA_ASSUMED_MINUTES above)
  async queryHistory(measurement: string, field: string, rangeMinutes: number): Promise<HistoryPoint[]> {
    const queryApi = new InfluxDB({ url: this.url, token: this.token }).getQueryApi(this.org)
    const start = rangeMinutes > 0 ? `-${rangeMinutes}m` : 'time(v: 0)'
    const flux = `from(bucket: "${escapeFluxString(this.bucket)}")
  |> range(start: ${start})
  |> filter(fn: (r) => r._measurement == "${escapeFluxString(measurement)}" and r._field == "${escapeFluxString(field)}")
  |> aggregateWindow(every: ${aggregateWindowFor(rangeMinutes)}, fn: mean, createEmpty: false)
  |> sort(columns: ["_time"])`

    this.debug.debug('Querying InfluxDB history', { measurement, field, rangeMinutes })

    try {
      const rows = await queryApi.collectRows<HistoryPoint>(flux, (values, tableMeta) => {
        const time = tableMeta.get(values, '_time') as string
        const value = tableMeta.get(values, '_value') as number
        return { time, value }
      })
      this.debug.debug('InfluxDB history query completed', { measurement, field, points: rows.length })
      return rows
    } catch (e) {
      this.debug.error('Failed to query InfluxDB history', {
        measurement,
        field,
        error: e instanceof Error ? e.message : String(e),
      })
      throw e
    }
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
    if (device.vars['ups.status']?.value === upsStatus.DEVICE_UNREACHABLE) {
      this.debug.debug('Skipping unreachable device', { device: device.name })
      return
    }

    let floatFieldCount = 0
    let stringFieldCount = 0

    const point = new Point(device.name).tag('description', device.description).tag('server', device.server) // Server tag for multi-server disambiguation

    for (const [key, variable] of Object.entries(device.vars)) {
      const value = variable.value

      if (typeof value === 'number') {
        point.floatField(key, value)
        floatFieldCount++
      } else if (typeof value === 'string') {
        point.stringField(key, value)
        stringFieldCount++
      }
    }

    if (floatFieldCount === 0 && stringFieldCount === 0) {
      return
    }

    if (timestamp) {
      point.timestamp(timestamp)
    }

    try {
      this.writeApi.writePoint(point)
    } catch (e) {
      this.debug.error('Failed to write point', {
        device: device.name,
        error: e instanceof Error ? e.message : String(e),
      })
      console.error(`Failed to write point for device ${device.name}:`, e)
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
