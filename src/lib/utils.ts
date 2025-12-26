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
// Supports URL-safe format "host~port~name" (preferred) and legacy format "name"
// Also supports backward compatible "host_port_name" format
export function parseDeviceId(deviceId: string): { host?: string; port?: number; name: string } {
  // 1. Try preferred tilde separator format: host~port~name
  if (deviceId.includes('~')) {
    const parts = deviceId.split('~')
    // Find the last numeric part that could be a port
    const portIdx = parts.findLastIndex((p, i) => i > 0 && /^\d+$/.test(p))

    if (portIdx !== -1) {
      return {
        host: parts.slice(0, portIdx).join('~'),
        port: Number.parseInt(parts[portIdx], 10),
        name: parts.slice(portIdx + 1).join('~'),
      }
    }
  }

  // 2. Try backward compatible underscore format: host_port_name
  // The port is numeric, everything after it is device name, everything before is host/alias
  const parts = deviceId.split('_')
  if (parts.length >= 3) {
    // Search backwards to find the numeric port
    // Port cannot be the first or last part in a composite ID
    const portIdx = parts.findLastIndex((p, i) => i > 0 && i < parts.length - 1 && /^\d+$/.test(p))

    if (portIdx !== -1) {
      return {
        host: parts.slice(0, portIdx).join('_'),
        port: Number.parseInt(parts[portIdx], 10),
        name: parts.slice(portIdx + 1).join('_'),
      }
    }
  }

  // 3. Legacy format: just the device name
  return { name: deviceId }
}
