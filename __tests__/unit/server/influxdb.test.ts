import { InfluxDB } from '@influxdata/influxdb-client'
import { PingAPI } from '@influxdata/influxdb-client-apis'
import InfluxWriter from '@/server/influxdb'

jest.mock('@influxdata/influxdb-client')
jest.mock('@influxdata/influxdb-client-apis')

describe('InfluxWriter', () => {
  const url = 'http://localhost:8086'
  const token = 'my-token'
  const org = 'my-org'
  const bucket = 'my-bucket'
  let influxWriter: InfluxWriter

  beforeEach(() => {
    influxWriter = new InfluxWriter(url, token, org, bucket)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize writeApi correctly', () => {
    expect(InfluxDB).toHaveBeenCalledWith({ url, token })
    expect(InfluxDB.prototype.getWriteApi).toHaveBeenCalledWith(org, bucket, 's')
  })

  it('should test connection successfully', async () => {
    const pingMock = jest.fn().mockResolvedValue('pong')
    PingAPI.prototype.getPing = pingMock

    const result = await influxWriter.testConnection()
    expect(result).toBe('pong')
    expect(PingAPI).toHaveBeenCalledWith(expect.any(InfluxDB))
    expect(pingMock).toHaveBeenCalled()
  })
})
