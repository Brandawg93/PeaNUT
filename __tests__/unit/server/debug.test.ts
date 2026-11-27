import { DebugLogger, createDebugLogger } from '../../../src/server/debug'

describe('DebugLogger', () => {
  const originalDebug = process.env.DEBUG
  let logSpy: jest.SpyInstance
  let infoSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance
  let errorSpy: jest.SpyInstance
  let debugSpy: jest.SpyInstance

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.DEBUG = originalDebug
    logSpy.mockRestore()
    infoSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
    debugSpy.mockRestore()
  })

  describe('when DEBUG is disabled', () => {
    beforeEach(() => {
      delete process.env.DEBUG
    })

    test('isEnabled returns false', () => {
      const logger = new DebugLogger()
      expect(logger.isEnabled()).toBe(false)
    })

    test('all log methods are no-ops', () => {
      const logger = new DebugLogger()
      logger.log('hi')
      logger.info('hi')
      logger.warn('hi')
      logger.error('hi')
      logger.debug('hi')
      expect(logSpy).not.toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
      expect(debugSpy).not.toHaveBeenCalled()
    })
  })

  describe('when DEBUG is enabled', () => {
    beforeEach(() => {
      process.env.DEBUG = 'true'
    })

    test('isEnabled returns true', () => {
      expect(new DebugLogger().isEnabled()).toBe(true)
    })

    test('DEBUG=1 also enables', () => {
      process.env.DEBUG = '1'
      expect(new DebugLogger().isEnabled()).toBe(true)
    })

    test('log writes formatted message via console.log', () => {
      const logger = new DebugLogger({ timestamp: false })
      logger.log('hello')
      expect(logSpy).toHaveBeenCalledWith('[DEBUG] LOG hello')
    })

    test('info writes via console.info', () => {
      const logger = new DebugLogger({ timestamp: false })
      logger.info('hello')
      expect(infoSpy).toHaveBeenCalledWith('[DEBUG] INFO hello')
    })

    test('warn writes via console.warn', () => {
      const logger = new DebugLogger({ timestamp: false })
      logger.warn('hello')
      expect(warnSpy).toHaveBeenCalledWith('[DEBUG] WARN hello')
    })

    test('error writes via console.error', () => {
      const logger = new DebugLogger({ timestamp: false })
      logger.error('hello')
      expect(errorSpy).toHaveBeenCalledWith('[DEBUG] ERROR hello')
    })

    test('debug writes via console.debug', () => {
      const logger = new DebugLogger({ timestamp: false })
      logger.debug('hello')
      expect(debugSpy).toHaveBeenCalledWith('[DEBUG] DEBUG hello')
    })

    test('appends JSON-stringified data when provided', () => {
      const logger = new DebugLogger({ timestamp: false })
      logger.log('payload', { a: 1 })
      expect(logSpy).toHaveBeenCalledWith(`[DEBUG] LOG payload ${JSON.stringify({ a: 1 }, null, 2)}`)
    })

    test('includes ISO timestamp when timestamp option is true', () => {
      const logger = new DebugLogger({ timestamp: true })
      logger.log('hi')
      const msg = logSpy.mock.calls[0][0] as string
      expect(msg).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z \[DEBUG\] LOG hi$/)
    })

    test('child logger nests prefixes', () => {
      const logger = new DebugLogger({ timestamp: false, prefix: '[ROOT]' })
      const child = logger.child('mod')
      child.log('hi')
      expect(logSpy).toHaveBeenCalledWith('[ROOT] [mod] LOG hi')
    })
  })

  describe('createDebugLogger', () => {
    beforeEach(() => {
      process.env.DEBUG = 'true'
    })

    test('creates module-scoped logger with bracketed module name', () => {
      const logger = createDebugLogger('mymodule', { timestamp: false })
      logger.warn('boom')
      expect(warnSpy).toHaveBeenCalledWith('[DEBUG] [mymodule] WARN boom')
    })

    test('defaults timestamp to true', () => {
      const logger = createDebugLogger('mymodule')
      logger.log('hi')
      const msg = logSpy.mock.calls[0][0] as string
      expect(msg).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })
})
