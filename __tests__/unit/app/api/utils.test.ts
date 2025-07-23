import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'
import {
  getNutInstances,
  getSingleNutInstance,
  deviceNotFoundError,
  parameterNotFoundError,
  deviceNotFoundOnAnyInstanceError,
  failedOperationError,
  successfulOperationMessage,
  handleDeviceOperation,
  handleVariableOperation,
  getDeviceVariablesData,
} from '@/app/api/utils'

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}))

// Mock dependencies
jest.mock('@/app/actions', () => ({
  getSettings: jest.fn(),
}))

jest.mock('@/server/nut')

const mockGetSettings = getSettings as jest.MockedFunction<typeof getSettings>

// Test utilities and common mocks
const createMockServer = (
  host: string = 'server1',
  port: number = 3493,
  username: string = 'user',
  password?: string
) => ({
  HOST: host,
  PORT: port,
  USERNAME: username,
  PASSWORD: password,
})

const createMockNut = (deviceExistsResult: boolean | Error = true, additionalMethods: Record<string, any> = {}) =>
  ({
    deviceExists: jest.fn().mockImplementation(() => {
      if (deviceExistsResult instanceof Error) {
        return Promise.reject(deviceExistsResult)
      }
      return Promise.resolve(deviceExistsResult)
    }),
    ...additionalMethods,
  }) as unknown as Nut

const setupNutMock = (mockNut: Nut) => {
  const NutMock = Nut as jest.MockedClass<typeof Nut>
  NutMock.mockReturnValue(mockNut)
  return NutMock
}

const setupServerSettings = (servers: any[] = [createMockServer()]) => {
  mockGetSettings.mockResolvedValue(servers)
}

const testErrorResponse = (response: any, expectedStatus: number, expectedMessage: string | object) => {
  expect(response).toBeDefined()
  expect(response.status).toBe(expectedStatus)
  expect(response.json()).resolves.toEqual(expectedMessage)
}

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getNutInstances', () => {
    it('should return array of Nut instances from settings', async () => {
      const mockServers = [createMockServer('localhost'), createMockServer('192.168.1.100', 3493, 'admin', 'secret')]
      setupServerSettings(mockServers)

      const result = await getNutInstances()

      expect(mockGetSettings).toHaveBeenCalledWith('NUT_SERVERS')
      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Nut)
      expect(result[1]).toBeInstanceOf(Nut)
    })

    it('should handle empty servers array', async () => {
      setupServerSettings([])

      const result = await getNutInstances()

      expect(result).toHaveLength(0)
    })
  })

  describe('getSingleNutInstance', () => {
    it('should return the first Nut instance that has the device', async () => {
      const mockNut1 = createMockNut(false)
      const mockNut2 = createMockNut(true)

      setupServerSettings([createMockServer('server1'), createMockServer('server2')])

      const NutMock = Nut as jest.MockedClass<typeof Nut>
      NutMock.mockImplementation((host: string) => {
        if (host === 'server1') return mockNut1
        return mockNut2
      })

      const result = await getSingleNutInstance('test-device')

      expect(result).toBe(mockNut2)
      expect(mockNut1.deviceExists).toHaveBeenCalledWith('test-device')
      expect(mockNut2.deviceExists).toHaveBeenCalledWith('test-device')
    })

    it('should return undefined when device is not found on any instance', async () => {
      const mockNut = createMockNut(false)
      setupServerSettings()
      setupNutMock(mockNut)

      const result = await getSingleNutInstance('nonexistent-device')

      expect(result).toBeUndefined()
      expect(mockNut.deviceExists).toHaveBeenCalledWith('nonexistent-device')
    })

    it('should return undefined when deviceExists throws an error', async () => {
      const mockNut = createMockNut(new Error('Connection failed'))
      setupServerSettings()
      setupNutMock(mockNut)

      const result = await getSingleNutInstance('test-device')
      expect(result).toBeUndefined()
      expect(mockNut.deviceExists).toHaveBeenCalledWith('test-device')
    })
  })

  describe('deviceNotFoundError', () => {
    it('should return 404 response with device not found error', () => {
      const result = deviceNotFoundError()
      testErrorResponse(result, 404, { error: 'Device not found' })
    })
  })

  describe('parameterNotFoundError', () => {
    it('should return 404 response with parameter not found error', () => {
      const result = parameterNotFoundError('battery.charge', 'test-device')
      testErrorResponse(result, 404, 'Parameter battery.charge on device test-device not found')
    })
  })

  describe('deviceNotFoundOnAnyInstanceError', () => {
    it('should return 404 response with device not found on any instance error', () => {
      const result = deviceNotFoundOnAnyInstanceError('test-device')
      testErrorResponse(result, 404, 'Device test-device not found on any instance')
    })
  })

  describe('failedOperationError', () => {
    it('should return 500 response with failed operation error', () => {
      const result = failedOperationError('get', 'battery.charge', 'test-device')
      testErrorResponse(result, 500, 'Failed to get battery.charge on device test-device')
    })
  })

  describe('successfulOperationMessage', () => {
    it('should return success message for non-save operations', () => {
      const result = successfulOperationMessage('get', 'battery.charge', 'test-device')
      expect(result).toBe('get battery.charge on device test-device run successfully')
    })

    it('should return success message for Variable save operations', () => {
      const result = successfulOperationMessage('Variable', 'battery.charge', 'test-device')
      expect(result).toBe('Variable battery.charge on device test-device saved successfully')
    })

    it('should return success message for save operations', () => {
      const result = successfulOperationMessage('save', 'battery.charge', 'test-device')
      expect(result).toBe('save battery.charge on device test-device saved successfully')
    })
  })

  describe('handleDeviceOperation', () => {
    it('should handle successful device operation', async () => {
      const mockNut = createMockNut(true)
      setupServerSettings()
      setupNutMock(mockNut)

      const operation = jest.fn().mockResolvedValue({ success: true })

      const result = await handleDeviceOperation('test-device', operation)

      expect(result).toBeDefined()
      expect(result.json()).resolves.toEqual({ success: true })
      expect(operation).toHaveBeenCalledWith(mockNut)
    })

    it('should return device not found error when device does not exist', async () => {
      const mockNut = createMockNut(false)
      setupServerSettings()
      setupNutMock(mockNut)

      const operation = jest.fn()

      const result = await handleDeviceOperation('nonexistent-device', operation)

      testErrorResponse(result, 404, { error: 'Device not found' })
      expect(operation).not.toHaveBeenCalled()
    })

    it('should handle operation errors', async () => {
      const mockNut = createMockNut(true)
      setupServerSettings()
      setupNutMock(mockNut)

      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await handleDeviceOperation('test-device', operation)

      expect(result).toBeDefined()
      expect(result.status).toBe(500)
      expect(result.json()).resolves.toBe('Failed to Operation failed unknown on device test-device')
      expect(consoleSpy).toHaveBeenCalledWith(new Error('Operation failed'))

      consoleSpy.mockRestore()
    })
  })

  describe('handleVariableOperation', () => {
    it('should handle successful variable operation', async () => {
      const mockNut = createMockNut(true)
      setupServerSettings()
      setupNutMock(mockNut)

      const operation = jest.fn().mockResolvedValue({ value: '100' })

      const result = await handleVariableOperation('test-device', 'battery.charge', operation)

      expect(result).toBeDefined()
      expect(result.json()).resolves.toEqual({ value: '100' })
      expect(operation).toHaveBeenCalledWith(mockNut)
    })

    it('should return device not found error when device does not exist', async () => {
      const mockNut = createMockNut(false)
      setupServerSettings()
      setupNutMock(mockNut)

      const operation = jest.fn()

      const result = await handleVariableOperation('nonexistent-device', 'battery.charge', operation)

      testErrorResponse(result, 404, { error: 'Device not found' })
      expect(operation).not.toHaveBeenCalled()
    })

    it('should handle variable operation errors', async () => {
      const mockNut = createMockNut(true)
      setupServerSettings()
      setupNutMock(mockNut)

      const operation = jest.fn().mockRejectedValue(new Error('Variable not found'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await handleVariableOperation('test-device', 'battery.charge', operation)

      expect(result).toBeDefined()
      expect(result.status).toBe(404)
      expect(result.json()).resolves.toBe('Parameter battery.charge on device test-device not found')
      expect(consoleSpy).toHaveBeenCalledWith(new Error('Variable not found'))

      consoleSpy.mockRestore()
    })
  })

  describe('getDeviceVariablesData', () => {
    it('should return device variables data successfully', async () => {
      const mockVarsData = {
        'battery.charge': { value: '100' },
        'battery.voltage': { value: '12.5' },
        'ups.status': { value: 'OL' },
      }

      const mockNut = createMockNut(true, {
        getData: jest.fn().mockResolvedValue(mockVarsData),
      })
      setupServerSettings()
      setupNutMock(mockNut)

      const result = await getDeviceVariablesData('test-device')

      expect(result).toEqual({
        'battery.charge': '100',
        'battery.voltage': '12.5',
        'ups.status': 'OL',
      })
      expect(mockNut.getData).toHaveBeenCalledWith('test-device')
    })

    it('should throw error when device is not found', async () => {
      const mockNut = createMockNut(false)
      setupServerSettings()
      setupNutMock(mockNut)

      await expect(getDeviceVariablesData('nonexistent-device')).rejects.toThrow('Device not found')
    })

    it('should handle empty variables data', async () => {
      const mockNut = createMockNut(true, {
        getData: jest.fn().mockResolvedValue({}),
      })
      setupServerSettings()
      setupNutMock(mockNut)

      const result = await getDeviceVariablesData('test-device')

      expect(result).toEqual({})
      expect(mockNut.getData).toHaveBeenCalledWith('test-device')
    })
  })
})
