/* eslint-disable @typescript-eslint/no-require-imports */
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'
import { getDevices } from '@/app/actions'
import InfluxWriter from '@/server/influxdb'
import { DEFAULT_INFLUX_INTERVAL } from '@/common/constants'
import { existsSync, readFileSync } from 'fs'
import { load } from 'js-yaml'

// Mock dependencies
jest.mock('toad-scheduler', () => {
  const mockScheduler = {
    existsById: jest.fn().mockReturnValue(false),
    removeById: jest.fn(),
    addSimpleIntervalJob: jest.fn(),
    stop: jest.fn(),
  }

  return {
    ToadScheduler: jest.fn().mockImplementation(() => mockScheduler),
    SimpleIntervalJob: jest.fn().mockImplementation((config, task, id) => ({
      config,
      task,
      id,
    })),
    Task: jest.fn().mockImplementation((name, func) => ({
      name,
      func,
      executeAsync: jest.fn().mockImplementation(() => func()),
    })),
  }
})

// Mock chokidar
const mockChokidarWatch = jest.fn().mockReturnValue({
  on: jest.fn().mockReturnThis(),
  close: jest.fn(),
})

jest.mock('chokidar', () => ({
  watch: mockChokidarWatch,
}))

jest.mock('fs')
jest.mock('js-yaml')

// Mock InfluxDB client
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
  }
})

jest.mock('@influxdata/influxdb-client-apis')

// Mock getDevices
jest.mock('@/app/actions', () => ({
  getDevices: jest.fn().mockResolvedValue({
    devices: [
      {
        name: 'test-device-1',
        host: 'localhost',
        port: 3493,
        username: jest.fn(),
        password: jest.fn(),
      },
      {
        name: 'test-device-2',
        host: 'localhost',
        port: 3494,
        username: jest.fn(),
        password: jest.fn(),
      },
    ],
  }),
}))

// Mock InfluxWriter
jest.mock('@/server/influxdb', () => {
  return jest.fn().mockImplementation(() => {
    const mockWritePoint = jest.fn().mockResolvedValue({})
    const mockClose = jest.fn().mockResolvedValue({})
    return {
      writePoint: mockWritePoint,
      close: mockClose,
    }
  })
})

describe('Scheduler', () => {
  let mockToadScheduler: jest.Mocked<ToadScheduler>
  let onChangeFn: (() => void) | undefined
  const settingsFile = './config/settings.yml'
  const mockSettings = {
    INFLUX_HOST: 'http://localhost:8086',
    INFLUX_TOKEN: 'mytoken',
    INFLUX_ORG: 'myorg',
    INFLUX_BUCKET: 'mybucket',
    INFLUX_INTERVAL: 30,
  }

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks()

    // Setup mocks before importing the module
    mockToadScheduler = new ToadScheduler() as jest.Mocked<ToadScheduler>

    // Mock file system operations
    ;(existsSync as jest.Mock).mockReturnValue(true)
    ;(readFileSync as jest.Mock).mockReturnValue('mock yaml content')
    ;(load as jest.Mock).mockReturnValue(mockSettings)

    // Capture the onChange function from chokidar.watch().on
    mockChokidarWatch().on.mockImplementation((event: string, callback: () => void) => {
      if (event === 'change') {
        onChangeFn = callback
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should initialize scheduler with the settings interval', () => {
    // Import the module to trigger initialization
    jest.isolateModules(() => {
      require('@/server/scheduler')
    })

    expect(existsSync).toHaveBeenCalledWith(settingsFile)
    expect(readFileSync).toHaveBeenCalledWith(settingsFile, 'utf8')
    expect(load).toHaveBeenCalledWith('mock yaml content')
    expect(ToadScheduler).toHaveBeenCalled()
    expect(SimpleIntervalJob).toHaveBeenCalled()
    expect(mockToadScheduler.addSimpleIntervalJob).toHaveBeenCalled()
  })

  test('should create a task that writes to InfluxDB', async () => {
    const mockWritePoint = jest.fn().mockResolvedValue({})
    const mockClose = jest.fn().mockResolvedValue({})
    ;(InfluxWriter as jest.Mock).mockImplementation(() => ({
      writePoint: mockWritePoint,
      close: mockClose,
    }))

    jest.isolateModules(() => {
      require('@/server/scheduler')
    })

    // Get the function passed to the Task constructor
    const taskFn = (Task as jest.Mock).mock.calls[0][1]

    // Execute the task function and wait for promises to resolve
    await taskFn()
    await new Promise(process.nextTick) // Wait for promises to resolve

    // Verify that getDevices was called
    expect(getDevices).toHaveBeenCalled()

    // Verify InfluxWriter was initialized with correct params
    expect(InfluxWriter).toHaveBeenCalledWith('http://localhost:8086', 'mytoken', 'myorg', 'mybucket')

    // Verify writePoint was called for each device
    expect(mockWritePoint).toHaveBeenCalledTimes(2)
    expect(mockClose).toHaveBeenCalled()
  })

  test('should update job when settings change', () => {
    jest.isolateModules(() => {
      require('@/server/scheduler')
    })

    // Verify file watcher was initialized
    expect(mockChokidarWatch).toHaveBeenCalledWith(settingsFile)
    expect(mockChokidarWatch().on).toHaveBeenCalledWith('change', expect.any(Function))

    // Simulate settings file change
    if (onChangeFn) {
      onChangeFn()

      // Check if job was removed and added again
      expect(mockToadScheduler.existsById).toHaveBeenCalledWith('influxdb_job')
      expect(mockToadScheduler.addSimpleIntervalJob).toHaveBeenCalledTimes(4) // Once on init, once on change
    }
  })

  test('should not update job when InfluxDB settings are incomplete', () => {
    // Mock incomplete settings
    ;(load as jest.Mock).mockReturnValue({
      INFLUX_HOST: 'http://localhost:8086',
      // Token is missing
      INFLUX_ORG: 'myorg',
      INFLUX_BUCKET: 'mybucket',
      INFLUX_INTERVAL: 30,
    })

    jest.isolateModules(() => {
      require('@/server/scheduler')
    })

    // Simulate settings file change with incomplete settings
    if (onChangeFn) {
      // Reset the counter
      jest.clearAllMocks()
      onChangeFn()

      // Job should not be updated because settings are incomplete
      expect(mockToadScheduler.addSimpleIntervalJob).toHaveBeenCalledTimes(1)
    }
  })

  test('should handle errors when writing to InfluxDB', async () => {
    // Mock console.error
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    // Mock InfluxWriter to throw an error
    const mockWritePoint = jest.fn().mockRejectedValue(new Error('Connection failed'))
    const mockClose = jest.fn().mockResolvedValue({})
    ;(InfluxWriter as jest.Mock).mockImplementation(() => ({
      writePoint: mockWritePoint,
      close: mockClose,
    }))

    jest.isolateModules(() => {
      require('@/server/scheduler')
    })

    // Get the task function
    const taskFn = (Task as jest.Mock).mock.calls[0][1]

    // Execute the task function and wait for promises to resolve
    await taskFn()
    await new Promise(process.nextTick) // Wait for promises to resolve

    // Verify error was logged
    expect(mockConsoleError).toHaveBeenCalledWith('Error writing to InfluxDB:', expect.any(Error))

    // Restore console.error
    mockConsoleError.mockRestore()
  })

  test('should use DEFAULT_INFLUX_INTERVAL when not set in settings', () => {
    // Mock settings without INFLUX_INTERVAL
    ;(load as jest.Mock).mockReturnValue({
      INFLUX_HOST: 'http://localhost:8086',
      INFLUX_TOKEN: 'mytoken',
      INFLUX_ORG: 'myorg',
      INFLUX_BUCKET: 'mybucket',
      // INFLUX_INTERVAL is missing
    })

    jest.isolateModules(() => {
      require('@/server/scheduler')
    })

    // The SimpleIntervalJob should be created with the DEFAULT_INFLUX_INTERVAL
    expect(SimpleIntervalJob).toHaveBeenCalledWith(
      { seconds: DEFAULT_INFLUX_INTERVAL, runImmediately: true },
      expect.anything(),
      expect.anything()
    )
  })
})
