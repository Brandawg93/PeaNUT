import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'
import { server } from '@/common/types'
import { NextResponse } from 'next/server'

export const getNutInstances = async (): Promise<Array<Nut>> => {
  const NUT_SERVERS = await getSettings('NUT_SERVERS')
  const enabled = NUT_SERVERS.filter((s: server) => !s.DISABLED)
  return enabled.map((server: server) => new Nut(server.HOST, server.PORT, server.USERNAME, server.PASSWORD))
}

export const getSingleNutInstance = async (device: string): Promise<Nut | undefined> => {
  const nuts = await getNutInstances()
  try {
    return await Promise.any(
      nuts.map(async (nut) => ((await nut.deviceExists(device)) ? nut : Promise.reject(new Error('Device not found'))))
    )
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
  device: string,
  operation: (nut: Nut) => Promise<T>
): Promise<NextResponse> => {
  const nut = await getSingleNutInstance(device)

  if (!nut) {
    return deviceNotFoundError()
  }

  try {
    const result = await operation(nut)
    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return failedOperationError(errorMessage, 'unknown', device)
  }
}

// Utility function to handle variable operations with automatic cleanup
export const handleVariableOperation = async <T>(
  device: string,
  param: string,
  operation: (nut: Nut) => Promise<T>
): Promise<NextResponse> => {
  const nut = await getSingleNutInstance(device)

  if (!nut) {
    return deviceNotFoundError()
  }

  try {
    const result = await operation(nut)
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return parameterNotFoundError(param, device)
  }
}

// Utility function to get device variables data
export const getDeviceVariablesData = async (device: string): Promise<Record<string, string | number>> => {
  const nut = await getSingleNutInstance(device)

  if (!nut) {
    throw new Error('Device not found')
  }

  const varsData = await nut.getData(device)
  // Return just the values instead of the full VAR objects
  const varsValues: Record<string, string | number> = {}
  for (const [key, varData] of Object.entries(varsData)) {
    varsValues[key] = varData.value
  }
  return varsValues
}
