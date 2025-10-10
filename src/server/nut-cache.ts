import { cache, cacheSignal } from 'react'
import { Nut } from '@/server/nut'

/**
 * Cached wrapper for device description retrieval
 */
export const getCachedDeviceDescription = cache(async (host: string, port: number, device: string): Promise<string> => {
  const nut = new Nut(host, port)
  return await nut.getDescription(device)
})

/**
 * Cached wrapper for device commands retrieval
 */
export const getCachedCommands = cache(async (host: string, port: number, device: string): Promise<Array<string>> => {
  const nut = new Nut(host, port)
  return await nut.getCommands(device)
})

/**
 * Cached wrapper for device RW vars retrieval
 */
export const getCachedRWVars = cache(
  async (host: string, port: number, device: string): Promise<Array<keyof import('@/common/types').VARS>> => {
    const nut = new Nut(host, port)
    return await nut.getRWVars(device)
  }
)

/**
 * Cached wrapper for variable description retrieval
 */
export const getCachedVarDescription = cache(
  async (host: string, port: number, variable: string, device: string, socket?: any): Promise<string> => {
    const nut = new Nut(host, port)
    return await nut.getVarDescription(variable, device, socket)
  }
)

/**
 * Cached wrapper for variable type retrieval
 */
export const getCachedVarType = cache(
  async (host: string, port: number, variable: string, device: string, socket?: any): Promise<string> => {
    const nut = new Nut(host, port)
    return await nut.getType(variable, device, socket)
  }
)

/**
 * Cached wrapper for variable enum retrieval
 */
export const getCachedEnum = cache(
  async (host: string, port: number, variable: string, device: string): Promise<Array<string>> => {
    const nut = new Nut(host, port)
    return await nut.getEnum(variable, device)
  }
)

/**
 * Cached wrapper for variable range retrieval
 */
export const getCachedRange = cache(
  async (host: string, port: number, variable: string, device: string): Promise<Array<string>> => {
    const nut = new Nut(host, port)
    return await nut.getRange(variable, device)
  }
)

/**
 * Cached wrapper for command description retrieval
 */
export const getCachedCommandDescription = cache(
  async (host: string, port: number, command: string, device: string): Promise<string> => {
    const nut = new Nut(host, port)
    return await nut.getCommandDescription(command, device)
  }
)

/**
 * Helper function to get cache signal for cleanup
 */
export const getCacheSignal = () => cacheSignal()
