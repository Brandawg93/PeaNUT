'use client'

import { useState, useEffect, useCallback } from 'react'
import { DEVICE } from '@/common/types'
import { getDevices } from '@/app/actions'

export default function useFetch() {
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<any>(null)
  const [data, setData] = useState<{ devices: Array<DEVICE> | undefined; updated: number }>({
    devices: undefined,
    updated: new Date().getTime(),
  })

  const refetch = useCallback(() => {
    setLoading(true)
    getDevices()
      .then((devices) => {
        setData({ devices: devices, updated: new Date().getTime() })
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
