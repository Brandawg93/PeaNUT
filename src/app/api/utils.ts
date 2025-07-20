import { Nut } from '@/server/nut'
import { getSettings } from '@/app/actions'
import { server } from '@/common/types'
import { NextResponse } from 'next/server'

export const getNutInstances = async (): Promise<Array<Nut>> => {
  const NUT_SERVERS = await getSettings('NUT_SERVERS')
  return NUT_SERVERS.map((server: server) => new Nut(server.HOST, server.PORT, server.USERNAME, server.PASSWORD))
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
  return `${operation} ${param} on device ${device} ${isSaveOperation ? 'saved' : 'run'} successfully on device ${device}`
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

  const result = await operation(nut)
  return NextResponse.json(result)
}

// Utility function to handle variable operations with automatic cleanup
export const handleVariableOperation = async <T>(
  device: string,
  param: string,
  operation: (nut: Nut) => Promise<T>
): Promise<NextResponse> => {
  const nut = await getSingleNutInstance(device)
  const paramString = param

  if (!nut) {
    return deviceNotFoundError()
  }

  try {
    const result = await operation(nut)
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return parameterNotFoundError(paramString, device)
  }
}

// Utility function to handle command operations with automatic cleanup
export const handleCommandOperation = async (
  device: string,
  param: string,
  operation: (nut: Nut) => Promise<void>
): Promise<NextResponse> => {
  const nut = await getSingleNutInstance(device)

  if (!nut) {
    return deviceNotFoundError()
  }

  try {
    await operation(nut)
    return NextResponse.json({ message: 'Command executed successfully' })
  } catch {
    return NextResponse.json({ error: 'Invalid command' }, { status: 400 })
  }
}
