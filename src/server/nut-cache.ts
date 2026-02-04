import { cache, cacheSignal } from 'react'
import { Nut } from '@/server/nut'
import { VARS } from '@/common/types'

// Global caches for static data that persists across requests
const deviceDescriptionCache = new Map<string, string>()
const commandsCache = new Map<string, Array<string>>()
const rwVarsCache = new Map<string, Array<keyof VARS>>()
const varDescriptionCache = new Map<string, string>()
const varTypeCache = new Map<string, string>()
const enumCache = new Map<string, Array<string>>()
const rangeCache = new Map<string, Array<string>>()
const commandDescriptionCache = new Map<string, string>()

const getCacheKey = (...args: (string | number)[]) => args.join(':')

/**
 * Reset all global caches. Mostly used for testing.
 */
export const resetCaches = () => {
  deviceDescriptionCache.clear()
  commandsCache.clear()
  rwVarsCache.clear()
  varDescriptionCache.clear()
  varTypeCache.clear()
  enumCache.clear()
  rangeCache.clear()
  commandDescriptionCache.clear()
}

/**
 * Cached wrapper for device description retrieval
 */
export const getCachedDeviceDescription = cache(async (host: string, port: number, device: string): Promise<string> => {
  const key = getCacheKey(host, port, device)
  if (deviceDescriptionCache.has(key)) {
    return deviceDescriptionCache.get(key)!
  }
  const nut = new Nut(host, port)
  const result = await nut.getDescription(device)
  deviceDescriptionCache.set(key, result)
  return result
})

/**
 * Cached wrapper for device commands retrieval
 */
export const getCachedCommands = cache(async (host: string, port: number, device: string): Promise<Array<string>> => {
  const key = getCacheKey(host, port, device)
  if (commandsCache.has(key)) {
    return commandsCache.get(key)!
  }
  const nut = new Nut(host, port)
  const result = await nut.getCommands(device)
  commandsCache.set(key, result)
  return result
})

/**
 * Cached wrapper for device RW vars retrieval
 */
export const getCachedRWVars = cache(async (host: string, port: number, device: string): Promise<Array<keyof VARS>> => {
  const key = getCacheKey(host, port, device)
  if (rwVarsCache.has(key)) {
    return rwVarsCache.get(key)!
  }
  const nut = new Nut(host, port)
  const result = await nut.getRWVars(device)
  rwVarsCache.set(key, result)
  return result
})

/**
 * Cached wrapper for variable description retrieval
 */
export const getCachedVarDescription = cache(
  async (host: string, port: number, variable: string, device: string, socket?: any): Promise<string> => {
    const key = getCacheKey(host, port, device, variable)
    if (varDescriptionCache.has(key)) {
      return varDescriptionCache.get(key)!
    }
    const nut = new Nut(host, port)
    const result = await nut.getVarDescription(variable, device, socket)
    varDescriptionCache.set(key, result)
    return result
  }
)

/**
 * Cached wrapper for variable type retrieval
 */
export const getCachedVarType = cache(
  async (host: string, port: number, variable: string, device: string, socket?: any): Promise<string> => {
    const key = getCacheKey(host, port, device, variable)
    if (varTypeCache.has(key)) {
      return varTypeCache.get(key)!
    }
    const nut = new Nut(host, port)
    const result = await nut.getType(variable, device, socket)
    varTypeCache.set(key, result)
    return result
  }
)

/**
 * Cached wrapper for variable enum retrieval
 */
export const getCachedEnum = cache(
  async (host: string, port: number, variable: string, device: string): Promise<Array<string>> => {
    const key = getCacheKey(host, port, device, variable)
    if (enumCache.has(key)) {
      return enumCache.get(key)!
    }
    const nut = new Nut(host, port)
    const result = await nut.getEnum(variable, device)
    enumCache.set(key, result)
    return result
  }
)

/**
 * Cached wrapper for variable range retrieval
 */
export const getCachedRange = cache(
  async (host: string, port: number, variable: string, device: string): Promise<Array<string>> => {
    const key = getCacheKey(host, port, device, variable)
    if (rangeCache.has(key)) {
      return rangeCache.get(key)!
    }
    const nut = new Nut(host, port)
    const result = await nut.getRange(variable, device)
    rangeCache.set(key, result)
    return result
  }
)

/**
 * Cached wrapper for command description retrieval
 */
export const getCachedCommandDescription = cache(
  async (host: string, port: number, command: string, device: string): Promise<string> => {
    const key = getCacheKey(host, port, device, command)
    if (commandDescriptionCache.has(key)) {
      return commandDescriptionCache.get(key)!
    }
    const nut = new Nut(host, port)
    const result = await nut.getCommandDescription(command, device)
    commandDescriptionCache.set(key, result)
    return result
  }
)

/**
 * Helper function to get cache signal for cleanup
 */
export const getCacheSignal = () => cacheSignal()
