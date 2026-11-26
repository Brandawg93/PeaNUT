'use client'

import { env } from 'next-runtime-env'

export function useBasePath(): string {
  const basePath = env('NEXT_PUBLIC_BASE_PATH')

  // A root deployment has no path prefix.
  if (!basePath || basePath === '/') return ''
  return basePath.startsWith('/') ? basePath : `/${basePath}`
}
