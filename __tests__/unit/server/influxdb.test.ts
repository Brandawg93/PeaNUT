import { PingAPI } from '@influxdata/influxdb-client-apis'
import InfluxWriter from '@/server/influxdb'

jest.mock('@influxdata/influxdb-client', () => {
  const actual = jest.requireActual('@influxdata/influxdb-client')
  const mockWriteApi = {
    writePoint: jest.fn(),
  }
  const mockInfluxDB = jest.fn().mockImplementation(() => ({
    getWriteApi: jest.fn().mockReturnValue(mockWriteApi),
  }))
  mockInfluxDB.prototype = { getWriteApi: jest.fn().mockReturnValue(mockWriteApi) }

  return {
    ...actual,
    InfluxDB: mockInfluxDB,
  }
})
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

  it('should test connection successfully', async () => {
    const pingMock = jest.fn().mockResolvedValue('pong')
    PingAPI.prototype.getPing = pingMock

    const result = await influxWriter.testConnection()
    expect(result).toBe('pong')
    expect(PingAPI).toHaveBeenCalledWith(expect.any(Object))
    expect(pingMock).toHaveBeenCalled()
  })

  it('should write numeric fields correctly', () => {
    const device = {
      name: 'test-device',
      description: 'test description',
      vars: {
        temperature: { value: 25.5 },
        humidity: { value: 60 },
      },
      rwVars: [],
      commands: [],
      clients: [],
    }

    const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
    influxWriter.writePoint(device)
    expect(writePointMock).toHaveBeenCalled()
  })
})
