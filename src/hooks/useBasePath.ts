'use client'

import { env } from 'next-runtime-env'

export function useBasePath(): string {
  const basePath = env('NEXT_PUBLIC_BASE_PATH') || ''

  // Normalize base path to always have a leading slash
  if (!basePath) return ''
  return basePath.startsWith('/') ? basePath : `/${basePath}`
}
