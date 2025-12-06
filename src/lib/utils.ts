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
// Supports URL-safe format "host_port_name" and legacy format "name"
export function parseDeviceId(deviceId: string): { host?: string; port?: number; name: string } {
  // URL-safe format: host_port_name (e.g., "192.168.1.10_3493_ups")
  // Split from the right: last part is name, second-to-last is port, rest is host
  const parts = deviceId.split('_')
  if (parts.length >= 3) {
    const name = parts.pop()!
    const portStr = parts.pop()!
    const port = Number.parseInt(portStr, 10)
    // Check if it's actually a port number (numeric)
    if (!Number.isNaN(port)) {
      const host = parts.join('_') // Rejoin remaining parts as host (handles underscores in hostname)
      return { host, port, name }
    }
  }
  // Legacy format: just the device name
  return { name: deviceId }
}
