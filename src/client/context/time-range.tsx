'use client'

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/utils'

type TimeRangeContextType = {
  timeRange: number
  setTimeRange: (range: number) => void
}

const TimeRangeContext = createContext<TimeRangeContextType | undefined>(undefined)

export function TimeRangeProvider({ children }: { readonly children: React.ReactNode }) {
  const [timeRange, setTimeRangeState] = useState<number>(() => {
    const stored = getLocalStorageItem('timeRange')
    return stored !== null ? Number(stored) : 0
  })

  const setTimeRange = useCallback((range: number) => {
    setTimeRangeState(range)
    setLocalStorageItem('timeRange', range.toString())
  }, [])

  const value = useMemo(() => ({ timeRange, setTimeRange }), [timeRange, setTimeRange])

  return <TimeRangeContext.Provider value={value}>{children}</TimeRangeContext.Provider>
}

export function useTimeRange() {
  const context = useContext(TimeRangeContext)
  if (context === undefined) {
    throw new Error('useTimeRange must be used within a TimeRangeProvider')
  }
  return context
}
