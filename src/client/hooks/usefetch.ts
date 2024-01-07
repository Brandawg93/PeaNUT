'use client'

import { useState, useEffect, useCallback } from 'react'
import { DEVICE } from '@/common/types'
import { getDevices } from '@/app/actions'

export default function useFetch() {
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<any>(null)
  const [data, setData] = useState<{ devices: Array<DEVICE> | undefined; updated: Date }>({
    devices: undefined,
    updated: new Date(),
  })

  const refetch = useCallback(() => {
    setLoading(true)
    getDevices()
      .then((gridProps) => {
        setData({ devices: gridProps, updated: new Date() })
        setLoading(false)
      })
      .catch((error: any) => {
        setError(error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, refetch, loading, error }
}
