'use client'

import { useRouter } from 'next/navigation'
import { useBasePath } from './useBasePath'

export function useNavigation() {
  const router = useRouter()
  const basePath = useBasePath()

  const push = (path: string) => {
    router.push(`${basePath}${path}`)
  }

  const replace = (path: string) => {
    router.replace(`${basePath}${path}`)
  }

  return { push, replace, basePath }
}
