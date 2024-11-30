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
