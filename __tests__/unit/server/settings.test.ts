import { existsSync, readFileSync } from 'fs'
import { load } from 'js-yaml'
import { YamlSettings } from '../../../src/server/settings'

jest.mock('fs')
jest.mock('js-yaml')

describe('YamlSettings', () => {
  const filePath = './__tests__/settings.yml'
  let yamlSettings: YamlSettings

  beforeEach(() => {
    jest.clearAllMocks()
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
  })

  describe('initWithEnvVars', () => {
    it('should load settings from environment variables and save', () => {
      process.env.NUT_PORT = '1234'
      process.env.WEB_HOST = 'example.com'
      const saveSpy = jest.spyOn(yamlSettings as any, 'save')

      yamlSettings.initWithEnvVars()

      expect(yamlSettings.get('NUT_PORT')).toBe(1234)
      expect(yamlSettings.get('WEB_HOST')).toBe('example.com')
      expect(saveSpy).toHaveBeenCalled()
    })
  })

  describe('get', () => {
    it('should return the value for a given key', () => {
      yamlSettings.set('testKey', 'testValue')
      expect(yamlSettings.get('testKey')).toBe('testValue')
    })
  })

  describe('set', () => {
    it('should set the value for a given key and save', () => {
      const saveSpy = jest.spyOn(yamlSettings as any, 'save')
      yamlSettings.set('testKey', 'testValue')

      expect(yamlSettings.get('testKey')).toBe('testValue')
      expect(saveSpy).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete the value for a given key and save', () => {
      yamlSettings.set('testKey', 'testValue')
      const saveSpy = jest.spyOn(yamlSettings as any, 'save')
      yamlSettings.delete('testKey')

      expect(yamlSettings.get('testKey')).toBeUndefined()
      expect(saveSpy).toHaveBeenCalled()
    })
  })

  describe('getAll', () => {
    it('should return all data', () => {
      yamlSettings.set('key1', 'value1')
      yamlSettings.set('key2', 'value2')

      expect(Object.keys(yamlSettings.getAll())).toContain('key1')
      expect(Object.keys(yamlSettings.getAll())).toContain('key2')
    })
  })
})
