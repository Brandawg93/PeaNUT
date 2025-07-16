import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
