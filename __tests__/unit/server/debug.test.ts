import { DebugLogger, createDebugLogger } from '@/server/debug'

describe('DebugLogger', () => {
  const originalEnv = { ...process.env }
  const originalConsole = { ...console }

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
    console.log = jest.fn()
    console.info = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()
    console.debug = jest.fn()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    console.log = originalConsole.log
    console.info = originalConsole.info
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.debug = originalConsole.debug
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('does not log when DEBUG is disabled', () => {
    delete process.env.DEBUG
    const logger = new DebugLogger()
    logger.log('message')
    logger.info('message')
    logger.warn('message')
    logger.error('message')
    logger.debug('message')

    expect(console.log).not.toHaveBeenCalled()
    expect(console.info).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
    expect(console.debug).not.toHaveBeenCalled()
  })

  it('logs messages with prefix when DEBUG=true', () => {
    process.env.DEBUG = 'true'
    const logger = new DebugLogger({ prefix: '[TEST]', timestamp: false })
    logger.log('hello')
    logger.info('info', { a: 1 })
    logger.warn('warn')
    logger.error('error')
    logger.debug('debug')

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[TEST] LOG hello'))
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('[TEST] INFO info'))
    expect((console.info as jest.Mock).mock.calls[0][0]).toEqual(expect.stringContaining('"a": 1'))
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('[TEST] WARN warn'))
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[TEST] ERROR error'))
    expect(console.debug).toHaveBeenCalledWith(expect.stringContaining('[TEST] DEBUG debug'))
  })

  it('includes timestamp when enabled', () => {
    process.env.DEBUG = '1'
    const logger = new DebugLogger({ prefix: '[TEST]', timestamp: true })
    logger.log('ts')
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('2024-01-01T00:00:00.000Z'))
  })

  it('child logger extends prefix', () => {
    process.env.DEBUG = 'true'
    const parent = new DebugLogger({ prefix: '[ROOT]', timestamp: false })
    const child = parent.child('MOD')
    child.log('msg')
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[ROOT] [MOD] LOG msg'))
  })

  it('factory creates logger with default [DEBUG] prefix', () => {
    process.env.DEBUG = 'true'
    const logger = createDebugLogger('Module', { timestamp: false })
    logger.log('x')
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[DEBUG] [Module] LOG x'))
  })

  it('isEnabled reflects environment flag', () => {
    process.env.DEBUG = 'true'
    expect(new DebugLogger().isEnabled()).toBe(true)
    process.env.DEBUG = '1'
    expect(new DebugLogger().isEnabled()).toBe(true)
    process.env.DEBUG = 'false'
    expect(new DebugLogger().isEnabled()).toBe(false)
  })
})

