import { existsSync, readFileSync } from 'fs'
import { load } from 'js-yaml'
import { YamlSettings } from '../../../src/server/settings'

jest.mock('fs')
jest.mock('js-yaml')

describe('YamlSettings', () => {
  const filePath = './__tests__/settings.yml'
  let yamlSettings: YamlSettings
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    yamlSettings = new YamlSettings(filePath)
    process.env = { ...OLD_ENV }
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
      ;(readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File read error')
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      yamlSettings = new YamlSettings(filePath)

      expect(consoleSpy).toHaveBeenCalledWith('Error loading settings file: Error: File read error')
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
})
