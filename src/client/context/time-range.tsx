'use client'

import React, { createContext, useContext, useState, useMemo } from 'react'

type TimeRangeContextType = {
  timeRange: number
  setTimeRange: (range: number) => void
}

const TimeRangeContext = createContext<TimeRangeContextType | undefined>(undefined)

export function TimeRangeProvider({ children }: { readonly children: React.ReactNode }) {
  const [timeRange, setTimeRangeState] = useState<number>(() => {
    const stored = localStorage.getItem('timeRange')
    return stored !== null ? Number(stored) : 0
  })

  const setTimeRange = (range: number) => {
    setTimeRangeState(range)
    localStorage.setItem('timeRange', range.toString())
  }

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
