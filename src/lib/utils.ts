import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TIME_CONSTANTS = {
  DAY: 3600 * 24,
  HOUR: 3600,
  MINUTE: 60,
} as const

export function secondsToDhms(seconds: number): string {
  if (seconds <= 0) {
    return 'N/A'
  }

  const d = Math.floor(seconds / TIME_CONSTANTS.DAY)
  const h = Math.floor((seconds % TIME_CONSTANTS.DAY) / TIME_CONSTANTS.HOUR)
  const m = Math.floor((seconds % TIME_CONSTANTS.HOUR) / TIME_CONSTANTS.MINUTE)
  const s = Math.floor(seconds % TIME_CONSTANTS.MINUTE)

  const parts = [
    d > 0 && `${d} ${d === 1 ? 'day' : 'days'}`,
    h > 0 && `${h} ${h === 1 ? 'hour' : 'hours'}`,
    m > 0 && `${m} ${m === 1 ? 'minute' : 'minutes'}`,
    s > 0 && `${s} ${s === 1 ? 'second' : 'seconds'}`,
  ].filter(Boolean)

  return parts.join(', ')
}

// Utility function to safely access localStorage
export function getLocalStorageItem(key: string): string | null {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }
  return null
}

export function setLocalStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Silently fail if localStorage is not available
    }
  }
}

// Parse device ID to extract server info and device name
// Supports both composite format "host:port/name" and legacy format "name"
export function parseDeviceId(deviceId: string): { host?: string; port?: number; name: string } {
  if (deviceId.includes('/')) {
    const [serverPart, name] = deviceId.split('/')
    const [host, portStr] = serverPart.split(':')
    return { host, port: parseInt(portStr, 10), name }
  }
  return { name: deviceId } // Legacy format
}
