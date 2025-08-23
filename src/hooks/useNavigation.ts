'use client'

import { useRouter } from 'next/navigation'
import { useBasePath } from './useBasePath'

export function useNavigation() {
  const router = useRouter()
  const basePath = useBasePath()

  const push = (path: string) => {
    router.push(`${basePath}${path}` as any)
  }

  const replace = (path: string) => {
    router.replace(`${basePath}${path}` as any)
  }

  return { push, replace, basePath }
}
