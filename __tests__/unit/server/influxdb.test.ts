import { PingAPI } from '@influxdata/influxdb-client-apis'
import { Point, HttpError } from '@influxdata/influxdb-client'
import InfluxWriter from '@/server/influxdb'
import { upsStatus } from '@/common/constants'
import { DEVICE } from '@/common/types'

// Mock the Point class
const mockPoint = {
  tag: jest.fn().mockReturnThis(),
  floatField: jest.fn().mockReturnThis(),
  stringField: jest.fn().mockReturnThis(),
  timestamp: jest.fn().mockReturnThis(),
}

jest.mock('@influxdata/influxdb-client', () => {
  const actual = jest.requireActual('@influxdata/influxdb-client')
  const mockWriteApi = {
    writePoint: jest.fn(),
    close: jest.fn(),
  }
  const mockInfluxDB = jest.fn().mockImplementation(() => ({
    getWriteApi: jest.fn().mockReturnValue(mockWriteApi),
  }))
  mockInfluxDB.prototype = { getWriteApi: jest.fn().mockReturnValue(mockWriteApi) }

  return {
    ...actual,
    InfluxDB: mockInfluxDB,
    Point: jest.fn().mockImplementation(() => mockPoint),
    HttpError: class extends Error {
      constructor(public statusCode: number) {
        super('HttpError')
        this.name = 'HttpError'
      }
    },
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
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const pingMock = jest.fn().mockResolvedValue('pong')
      PingAPI.prototype.getPing = pingMock

      const result = await influxWriter.testConnection()
      expect(result).toBe('pong')
      expect(PingAPI).toHaveBeenCalledWith(expect.any(Object))
      expect(pingMock).toHaveBeenCalled()
    })

    it('should handle connection test failure', async () => {
      const pingMock = jest.fn().mockRejectedValue(new Error('Connection failed'))
      PingAPI.prototype.getPing = pingMock

      await expect(influxWriter.testConnection()).rejects.toThrow('Connection failed')
    })
  })

  describe('writePoint', () => {
    const baseDevice: DEVICE = {
      name: 'test-device',
      description: 'test description',
      vars: {},
      rwVars: [],
      commands: [],
      clients: [],
    }

    it('should write numeric fields correctly', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          temperature: { value: 25.5 },
          humidity: { value: 60 },
          voltage: { value: 120.0 },
        },
      }

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device)

      expect(writePointMock).toHaveBeenCalledTimes(3)
      expect(Point).toHaveBeenCalledWith('test-device')
      expect(mockPoint.tag).toHaveBeenCalledWith('description', 'test description')
      expect(mockPoint.floatField).toHaveBeenCalledWith('temperature', 25.5)
      expect(mockPoint.floatField).toHaveBeenCalledWith('humidity', 60)
      expect(mockPoint.floatField).toHaveBeenCalledWith('voltage', 120.0)
    })

    it('should write string fields correctly', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          status: { value: 'Online' },
          model: { value: 'APC Smart-UPS 1500' },
          serial: { value: 'ABC123' },
        },
      }

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device)

      expect(writePointMock).toHaveBeenCalledTimes(3)
      expect(Point).toHaveBeenCalledWith('test-device')
      expect(mockPoint.tag).toHaveBeenCalledWith('description', 'test description')
      expect(mockPoint.stringField).toHaveBeenCalledWith('status', 'Online')
      expect(mockPoint.stringField).toHaveBeenCalledWith('model', 'APC Smart-UPS 1500')
      expect(mockPoint.stringField).toHaveBeenCalledWith('serial', 'ABC123')
    })

    it('should write mixed data types correctly', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          temperature: { value: 25.5 },
          status: { value: 'Online' },
          voltage: { value: 120.0 },
          model: { value: 'APC Smart-UPS 1500' },
        },
      }

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device)

      expect(writePointMock).toHaveBeenCalledTimes(4)
      expect(mockPoint.floatField).toHaveBeenCalledWith('temperature', 25.5)
      expect(mockPoint.floatField).toHaveBeenCalledWith('voltage', 120.0)
      expect(mockPoint.stringField).toHaveBeenCalledWith('status', 'Online')
      expect(mockPoint.stringField).toHaveBeenCalledWith('model', 'APC Smart-UPS 1500')
    })

    it('should skip writing when device is unreachable', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          status: { value: upsStatus.DEVICE_UNREACHABLE },
          temperature: { value: 25.5 },
        },
      }

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device)

      expect(writePointMock).not.toHaveBeenCalled()
    })

    it('should handle timestamp when provided as Date', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          temperature: { value: 25.5 },
        },
      }
      const timestamp = new Date('2023-01-01T12:00:00Z')

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device, timestamp)

      expect(writePointMock).toHaveBeenCalled()
      expect(mockPoint.timestamp).toHaveBeenCalledWith(timestamp)
    })

    it('should handle timestamp when provided as number', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          temperature: { value: 25.5 },
        },
      }
      const timestamp = 1672574400000 // Unix timestamp

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device, timestamp)

      expect(writePointMock).toHaveBeenCalled()
      expect(mockPoint.timestamp).toHaveBeenCalledWith(timestamp)
    })

    it('should not add timestamp when not provided', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          temperature: { value: 25.5 },
        },
      }

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device)

      expect(writePointMock).toHaveBeenCalled()
      expect(mockPoint.timestamp).not.toHaveBeenCalled()
    })

    it('should handle writePoint errors gracefully', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          temperature: { value: 25.5 },
        },
      }

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint').mockImplementation(() => {
        throw new Error('Write failed')
      })

      influxWriter.writePoint(device)

      expect(writePointMock).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to write float field temperature for device test-device:',
        expect.any(Error)
      )
      consoleErrorSpy.mockRestore()
    })

    it('should handle multiple writePoint errors', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          temperature: { value: 25.5 },
          humidity: { value: 60 },
          status: { value: 'Online' },
        },
      }

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint').mockImplementation(() => {
        throw new Error('Write failed')
      })

      influxWriter.writePoint(device)

      // Should attempt to write all fields and log errors for each
      expect(writePointMock).toHaveBeenCalledTimes(3)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3)
      consoleErrorSpy.mockRestore()
    })

    it('should handle device with empty vars', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {},
      }

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device)

      expect(writePointMock).not.toHaveBeenCalled()
    })

    it('should handle device with null/undefined values', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          temperature: { value: null as any },
          status: { value: undefined as any },
          valid: { value: 25.5 },
        },
      }

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device)

      // Should only write the valid numeric field
      expect(writePointMock).toHaveBeenCalledTimes(1)
      expect(mockPoint.floatField).toHaveBeenCalledWith('valid', 25.5)
    })

    it('should handle device with complex var descriptions', () => {
      const device: DEVICE = {
        ...baseDevice,
        vars: {
          temperature: {
            value: 25.5,
            description: 'Temperature in Celsius',
            type: 'float',
            range: ['0', '100'],
          },
          status: {
            value: 'Online',
            description: 'UPS Status',
            type: 'string',
            enum: ['Online', 'Offline', 'On Battery'],
          },
        },
      }

      const writePointMock = jest.spyOn(influxWriter['writeApi'], 'writePoint')
      influxWriter.writePoint(device)

      expect(writePointMock).toHaveBeenCalledTimes(2)
      expect(mockPoint.floatField).toHaveBeenCalledWith('temperature', 25.5)
      expect(mockPoint.stringField).toHaveBeenCalledWith('status', 'Online')
    })
  })

  describe('close', () => {
    it('should close the write API successfully', async () => {
      const closeMock = jest.fn().mockResolvedValue(undefined)
      influxWriter['writeApi'].close = closeMock

      await influxWriter.close()
      expect(closeMock).toHaveBeenCalled()
    })

    it('should handle 401 unauthorized error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const httpError = new HttpError(401, 'Unauthorized')
      const closeMock = jest.fn().mockRejectedValue(httpError)
      influxWriter['writeApi'].close = closeMock

      await influxWriter.close()
      expect(closeMock).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(httpError)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Could not connect to InfluxDB database.')
      consoleErrorSpy.mockRestore()
    })

    it('should handle other errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Test error')
      const closeMock = jest.fn().mockRejectedValue(error)
      influxWriter['writeApi'].close = closeMock

      await influxWriter.close()
      expect(closeMock).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(error)
      consoleErrorSpy.mockRestore()
    })

    it('should handle non-HttpError with statusCode', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = { statusCode: 401, message: 'Unauthorized' }
      const closeMock = jest.fn().mockRejectedValue(error)
      influxWriter['writeApi'].close = closeMock

      await influxWriter.close()
      expect(closeMock).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(error)
      // Should not call the specific 401 message since it's not an HttpError instance
      expect(consoleErrorSpy).not.toHaveBeenCalledWith('Could not connect to InfluxDB database.')
      consoleErrorSpy.mockRestore()
    })
  })
})
