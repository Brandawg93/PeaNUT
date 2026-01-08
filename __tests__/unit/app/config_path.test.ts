// Mock YamlSettings to avoid file system operations
jest.mock('@/server/settings')

describe('actions config path', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should use SETTINGS_FILE environment variable when set', async () => {
    const customPath = '/custom/path/settings.yml'
    process.env.SETTINGS_FILE = customPath

    // Import actions after setting the env var
    await import('@/app/actions')
    const { YamlSettings } = await import('@/server/settings')

    // Since settingsInstance is initialized lazily in getCachedSettings()
    // which is called by connect(), getDevices(), etc.
    const { getDevices } = await import('@/app/actions')

    // Mock getDevices dependencies or just check if YamlSettings was called with customPath
    try {
      await getDevices()
    } catch {
      // We expect it might fail because of other mocks, but we check the constructor call
    }

    expect(YamlSettings).toHaveBeenCalledWith(customPath)
  })

  it('should use default path when SETTINGS_FILE is not set', async () => {
    delete process.env.SETTINGS_FILE

    await import('@/app/actions')
    const { YamlSettings } = await import('@/server/settings')
    const { getDevices } = await import('@/app/actions')

    try {
      await getDevices()
    } catch {
      // We expect it might fail because of other mocks, but we check the constructor call
    }

    expect(YamlSettings).toHaveBeenCalledWith('./config/settings.yml')
  })
})
