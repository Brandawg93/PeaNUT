const mockNutMethods = {
  getDescription: jest.fn(),
  getCommands: jest.fn(),
  getRWVars: jest.fn(),
  getVarDescription: jest.fn(),
  getType: jest.fn(),
  getEnum: jest.fn(),
  getRange: jest.fn(),
  getCommandDescription: jest.fn(),
}

jest.mock('@/server/nut', () => ({
  Nut: jest.fn().mockImplementation(() => mockNutMethods),
}))

import {
  getCachedDeviceDescription,
  getCachedCommands,
  getCachedRWVars,
  getCachedVarDescription,
  getCachedVarType,
  getCachedEnum,
  getCachedRange,
  getCachedCommandDescription,
  getCacheSignal,
} from '@/server/nut-cache'
import { Nut } from '@/server/nut'

describe('nut-cache', () => {
  beforeEach(() => {
    Object.values(mockNutMethods).forEach((m) => m.mockReset())
  })

  test('getCachedDeviceDescription constructs Nut and calls getDescription', async () => {
    mockNutMethods.getDescription.mockResolvedValue('A description')
    const result = await getCachedDeviceDescription('host', 1234, 'ups')
    expect(Nut).toHaveBeenCalledWith('host', 1234)
    expect(mockNutMethods.getDescription).toHaveBeenCalledWith('ups')
    expect(result).toBe('A description')
  })

  test('getCachedCommands forwards to Nut.getCommands', async () => {
    mockNutMethods.getCommands.mockResolvedValue(['cmd1', 'cmd2'])
    const result = await getCachedCommands('h', 1, 'ups')
    expect(mockNutMethods.getCommands).toHaveBeenCalledWith('ups')
    expect(result).toEqual(['cmd1', 'cmd2'])
  })

  test('getCachedRWVars forwards to Nut.getRWVars', async () => {
    mockNutMethods.getRWVars.mockResolvedValue(['ups.delay.start'])
    const result = await getCachedRWVars('h', 1, 'ups')
    expect(mockNutMethods.getRWVars).toHaveBeenCalledWith('ups')
    expect(result).toEqual(['ups.delay.start'])
  })

  test('getCachedVarDescription forwards args including socket', async () => {
    mockNutMethods.getVarDescription.mockResolvedValue('desc')
    const sock = { id: 'sock' }
    const result = await getCachedVarDescription('h', 1, 'battery.charge', 'ups', sock)
    expect(mockNutMethods.getVarDescription).toHaveBeenCalledWith('battery.charge', 'ups', sock)
    expect(result).toBe('desc')
  })

  test('getCachedVarType forwards args including socket', async () => {
    mockNutMethods.getType.mockResolvedValue('NUMBER')
    const result = await getCachedVarType('h', 1, 'battery.charge', 'ups')
    expect(mockNutMethods.getType).toHaveBeenCalledWith('battery.charge', 'ups', undefined)
    expect(result).toBe('NUMBER')
  })

  test('getCachedEnum forwards args', async () => {
    mockNutMethods.getEnum.mockResolvedValue(['a', 'b'])
    const result = await getCachedEnum('h', 1, 'var', 'ups')
    expect(mockNutMethods.getEnum).toHaveBeenCalledWith('var', 'ups')
    expect(result).toEqual(['a', 'b'])
  })

  test('getCachedRange forwards args', async () => {
    mockNutMethods.getRange.mockResolvedValue(['0', '100'])
    const result = await getCachedRange('h', 1, 'var', 'ups')
    expect(mockNutMethods.getRange).toHaveBeenCalledWith('var', 'ups')
    expect(result).toEqual(['0', '100'])
  })

  test('getCachedCommandDescription forwards args', async () => {
    mockNutMethods.getCommandDescription.mockResolvedValue('Reboot UPS')
    const result = await getCachedCommandDescription('h', 1, 'shutdown.reboot', 'ups')
    expect(mockNutMethods.getCommandDescription).toHaveBeenCalledWith('shutdown.reboot', 'ups')
    expect(result).toBe('Reboot UPS')
  })

  test('getCacheSignal returns react cacheSignal value', () => {
    // cacheSignal returns either an AbortSignal or undefined depending on
    // whether we're inside a cache scope. We just verify the function is callable.
    expect(() => getCacheSignal()).not.toThrow()
  })
})
