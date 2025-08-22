'use client'

import { env } from 'next-runtime-env'

export function useBasePath(): string {
  return env('NEXT_PUBLIC_BASE_PATH') || ''
}
