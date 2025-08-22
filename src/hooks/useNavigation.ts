'use client'

import { useRouter } from 'next/navigation'
import { useBasePath } from './useBasePath'

export function useNavigation() {
  const router = useRouter()
  const basePath = useBasePath()

  const buildPath = (path: string) => {
    // Handle root path specially to avoid double slashes
    if (path === '/') {
      return basePath || '/'
    }
    return `${basePath}${path}`
  }

  const push = (path: string) => {
    router.push(buildPath(path))
  }

  const replace = (path: string) => {
    router.replace(buildPath(path))
  }

  return { push, replace, basePath }
}
