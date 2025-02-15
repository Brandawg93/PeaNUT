import { existsSync, readFileSync } from 'fs'
import { load, dump } from 'js-yaml'
import { YamlSettings } from '../../../src/server/settings'

jest.mock('js-yaml')

describe('YamlSettings', () => {
  const filePath = './__tests__/settings.yml'
  let yamlSettings: YamlSettings
  const OLD_ENV = process.env

  beforeAll(() => {
    delete process.env.NUT_SERVERS
    delete process.env.NUT_HOST
    delete process.env.NUT_PORT
    delete process.env.USERNAME
    delete process.env.PASSWORD
    delete process.env.INFLUX_HOST
    delete process.env.INFLUX_TOKEN
    delete process.env.INFLUX_ORG
    delete process.env.INFLUX_BUCKET
  })

  afterAll(() => {
    process.env = { ...OLD_ENV }
  })

  beforeEach(() => {
    jest.resetAllMocks()
    yamlSettings = new YamlSettings(filePath)
  })

  describe('constructor', () => {
    it('should load settings from file if it exists', () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      const fileContents = 'file contents'
      const parsedData = { key: 'value' }
      ;(readFileSync as jest.Mock).mockReturnValue(fileContents)
      ;(load as jest.Mock).mockReturnValue(parsedData)

      yamlSettings = new YamlSettings(filePath)

      expect(Object.keys(yamlSettings.getAll())).toContain('key')
    })

    it('should handle file read errors gracefully', () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File read error')
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      yamlSettings = new YamlSettings(filePath)

      expect(consoleSpy).toHaveBeenCalledWith('Error loading settings file: File read error')
      expect(yamlSettings.getAll()).toEqual(
        expect.objectContaining({
          NUT_SERVERS: [],
          INFLUX_HOST: '',
          INFLUX_TOKEN: '',
          INFLUX_ORG: '',
          INFLUX_BUCKET: '',
          INFLUX_INTERVAL: 10,
        })
      )

      consoleSpy.mockRestore()
    })

    it('initializes settings with environment variables', () => {
      process.env.NUT_HOST = 'localhost_env'
      process.env.NUT_PORT = '8082'

      const settingFromEnv1 = new YamlSettings(filePath)
      expect(settingFromEnv1.get('NUT_SERVERS')[0].HOST).toBe('localhost_env')
      expect(settingFromEnv1.get('NUT_SERVERS')[0].PORT).toBe(8082)
      delete process.env.NUT_HOST
      delete process.env.NUT_PORT

      process.env.NUT_SERVERS = '[{"HOST": "localhost_env", "PORT": 8082}]'
      const settingFromEnv2 = new YamlSettings(filePath)
      expect(settingFromEnv2.get('NUT_SERVERS')[0].HOST).toBe('localhost_env')
      expect(settingFromEnv2.get('NUT_SERVERS')[0].PORT).toBe(8082)
      delete process.env.NUT_SERVERS

      process.env.INFLUX_INTERVAL = '5'
      const settingFromEnv3 = new YamlSettings(filePath)
      expect(settingFromEnv3.get('INFLUX_INTERVAL')).toBe(5)
      delete process.env.INFLUX_INTERVAL

      process.env.INFLUX_HOST = 'localhost_env'
      const settingFromEnv4 = new YamlSettings(filePath)
      expect(settingFromEnv4.get('INFLUX_HOST')).toBe('localhost_env')
      delete process.env.INFLUX_HOST
    })
  })

  describe('get', () => {
    it('should return the value for a given key', () => {
      yamlSettings.set('INFLUX_TOKEN', 'testValue')
      expect(yamlSettings.get('INFLUX_TOKEN')).toBe('testValue')
    })
  })

  describe('set', () => {
    it('should set the value for a given key and save', () => {
      const saveSpy = jest.spyOn(yamlSettings as any, 'save')
      yamlSettings.set('INFLUX_TOKEN', 'testValue')

      expect(yamlSettings.get('INFLUX_TOKEN')).toBe('testValue')
      expect(saveSpy).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete the value for a given key and save', () => {
      yamlSettings.set('INFLUX_TOKEN', 'testValue')
      const saveSpy = jest.spyOn(yamlSettings as any, 'save')
      yamlSettings.delete('INFLUX_TOKEN')

      expect(yamlSettings.get('INFLUX_TOKEN')).toBeUndefined()
      expect(saveSpy).toHaveBeenCalled()
    })
  })

  describe('getAll', () => {
    it('should return all data', () => {
      yamlSettings.set('INFLUX_TOKEN', 'value1')
      yamlSettings.set('INFLUX_BUCKET', 'value2')

      expect(Object.keys(yamlSettings.getAll())).toContain('INFLUX_TOKEN')
      expect(Object.keys(yamlSettings.getAll())).toContain('INFLUX_BUCKET')
    })
  })

  describe('export', () => {
    it('should export settings as YAML string', () => {
      // Setup test data
      yamlSettings.set('INFLUX_HOST', 'test-host')
      yamlSettings.set('INFLUX_TOKEN', 'test-token')
      yamlSettings.set('NUT_SERVERS', [{ HOST: 'test-nut', PORT: 3493 }])

      const exported = yamlSettings.export()

      // Mock the dump function to return what it receives
      ;(dump as jest.Mock).mockImplementation((data) => JSON.stringify(data))

      expect(typeof exported).toBe('undefined')
      expect(dump).toHaveBeenCalledWith(yamlSettings.getAll())
    })
  })

  describe('import', () => {
    it('should import valid YAML settings', () => {
      const validYaml = `
        INFLUX_HOST: imported-host
        INFLUX_TOKEN: imported-token
        NUT_SERVERS:
          - HOST: imported-nut
            PORT: 3493
      `

      // Mock the load function to return parsed data
      ;(load as jest.Mock).mockReturnValue({
        INFLUX_HOST: 'imported-host',
        INFLUX_TOKEN: 'imported-token',
        NUT_SERVERS: [{ HOST: 'imported-nut', PORT: 3493 }],
      })

      yamlSettings.import(validYaml)

      expect(yamlSettings.get('INFLUX_HOST')).toBe('imported-host')
      expect(yamlSettings.get('INFLUX_TOKEN')).toBe('imported-token')
      expect(yamlSettings.get('NUT_SERVERS')).toEqual([{ HOST: 'imported-nut', PORT: 3493 }])
    })

    it('should throw error when importing invalid YAML', () => {
      const invalidYaml = '{'

      // Mock the load function to throw an error
      ;(load as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid YAML')
      })

      expect(() => yamlSettings.import(invalidYaml)).toThrow('Failed to import settings: Invalid YAML')
    })

    it('should preserve default values for missing fields', () => {
      const partialYaml = `
        INFLUX_HOST: imported-host
      `

      // Mock the load function to return partial data
      ;(load as jest.Mock).mockReturnValue({
        INFLUX_HOST: 'imported-host',
      })

      yamlSettings.import(partialYaml)

      expect(yamlSettings.get('INFLUX_HOST')).toBe('imported-host')
      expect(yamlSettings.get('INFLUX_INTERVAL')).toBe(10) // Default value
      expect(yamlSettings.get('NUT_SERVERS')).toEqual([
        {
          HOST: 'localhost_env',
          PASSWORD: undefined,
          PORT: 8082,
          USERNAME: undefined,
        },
      ]) // Default value
    })
  })
})
