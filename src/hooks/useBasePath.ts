'use client'

import { env } from 'next-runtime-env'

export function useBasePath(): string {
  return env('BASE_PATH') || ''
}
