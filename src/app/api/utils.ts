import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'
import { parseDeviceId } from '@/lib/utils'
import { server } from '@/common/types'
import { NextResponse } from 'next/server'

export const getNutInstances = async (): Promise<Array<Nut>> => {
  const NUT_SERVERS = await getSettings('NUT_SERVERS')
  const enabled = NUT_SERVERS.filter((s: server) => !s.DISABLED)
  return enabled.map((server: server) => new Nut(server.HOST, server.PORT, server.USERNAME, server.PASSWORD))
}

// Result type for getSingleNutInstance that includes device name
export type NutInstanceResult = {
  nut: Nut
  deviceName: string
}

export const getSingleNutInstance = async (deviceId: string): Promise<NutInstanceResult | undefined> => {
  const nuts = await getNutInstances()
  const parsed = parseDeviceId(deviceId)

  try {
    if (parsed.host && parsed.port) {
      // Composite ID format: find the specific server
      const matchingNut = nuts.find((n) => n.getHost() === parsed.host && n.getPort() === parsed.port)
      if (matchingNut && (await matchingNut.deviceExists(parsed.name))) {
        return { nut: matchingNut, deviceName: parsed.name }
      }
      return undefined
    }

    // Legacy format: find any server that has the device
    const nut = await Promise.any(
      nuts.map(async (n) => ((await n.deviceExists(parsed.name)) ? n : Promise.reject(new Error('Device not found'))))
    )
    return { nut, deviceName: parsed.name }
  } catch (error) {
    if (error instanceof AggregateError) {
      return undefined
    }
    throw error // Re-throw any other errors
  }
}

// Utility function for device not found error
export const deviceNotFoundError = () => {
  return NextResponse.json({ error: 'Device not found' }, { status: 404 })
}

// Utility function for parameter not found error
export const parameterNotFoundError = (param: string, device: string) => {
  return NextResponse.json(`Parameter ${param} on device ${device} not found`, { status: 404 })
}

// Utility function for device not found on any instance error
export const deviceNotFoundOnAnyInstanceError = (device: string) => {
  return NextResponse.json(`Device ${device} not found on any instance`, { status: 404 })
}

// Utility function for failed operation error
export const failedOperationError = (operation: string, param: string, device: string) => {
  return NextResponse.json(`Failed to ${operation} ${param} on device ${device}`, { status: 500 })
}

// Utility function for successful operation message
export const successfulOperationMessage = (operation: string, param: string, device: string) => {
  const isSaveOperation = operation === 'Variable' || operation === 'save'
  return `${operation} ${param} on device ${device} ${isSaveOperation ? 'saved' : 'run'} successfully`
}

// Utility function to handle device operations with automatic cleanup
export const handleDeviceOperation = async <T>(
  deviceId: string,
  operation: (nut: Nut, deviceName: string) => Promise<T>
): Promise<NextResponse> => {
  const result = await getSingleNutInstance(deviceId)

  if (!result) {
    return deviceNotFoundError()
  }

  try {
    const opResult = await operation(result.nut, result.deviceName)
    return NextResponse.json(opResult)
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return failedOperationError(errorMessage, 'unknown', deviceId)
  }
}

// Utility function to handle variable operations with automatic cleanup
export const handleVariableOperation = async <T>(
  deviceId: string,
  param: string,
  operation: (nut: Nut, deviceName: string) => Promise<T>
): Promise<NextResponse> => {
  const result = await getSingleNutInstance(deviceId)

  if (!result) {
    return deviceNotFoundError()
  }

  try {
    const opResult = await operation(result.nut, result.deviceName)
    return NextResponse.json(opResult)
  } catch (e) {
    console.error(e)
    return parameterNotFoundError(param, deviceId)
  }
}

// Utility function to get device variables data
export const getDeviceVariablesData = async (deviceId: string): Promise<Record<string, string | number>> => {
  const result = await getSingleNutInstance(deviceId)

  if (!result) {
    throw new Error('Device not found')
  }

  const varsData = await result.nut.getData(result.deviceName)
  // Return just the values instead of the full VAR objects
  const varsValues: Record<string, string | number> = {}
  for (const [key, varData] of Object.entries(varsData)) {
    varsValues[key] = varData.value
  }
  return varsValues
}
