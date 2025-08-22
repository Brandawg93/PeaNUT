import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get base path on client side
export function getBasePath(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use next-runtime-env
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { env } = require('next-runtime-env')
    return env('BASE_PATH') || ''
  }
  // Server-side: fallback to process.env
  return process.env.BASE_PATH || ''
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
