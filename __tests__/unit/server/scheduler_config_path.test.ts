// Mock YamlSettings
jest.mock('@/server/settings', () => {
  return {
    YamlSettings: jest.fn().mockImplementation(() => ({
      get: jest.fn().mockReturnValue(undefined),
    })),
  }
})

// Mock other dependencies of scheduler
jest.mock('toad-scheduler')
jest.mock('chokidar', () => ({
  watch: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
  }),
}))
jest.mock('@/app/actions')
jest.mock('@/server/influxdb')

describe('scheduler config path', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should use SETTINGS_FILE environment variable when set', async () => {
    const customPath = '/custom/path/scheduler_settings.yml'
    process.env.SETTINGS_FILE = customPath

    await import('@/server/scheduler')
    const { YamlSettings } = await import('@/server/settings')

    expect(YamlSettings).toHaveBeenCalledWith(customPath)
  })

  it('should use default path when SETTINGS_FILE is not set', async () => {
    delete process.env.SETTINGS_FILE

    await import('@/server/scheduler')
    const { YamlSettings } = await import('@/server/settings')

    expect(YamlSettings).toHaveBeenCalledWith('./config/settings.yml')
  })
})
