'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type TimeRangeContextType = {
  timeRange: number
  setTimeRange: (range: number) => void
}

const TimeRangeContext = createContext<TimeRangeContextType | undefined>(undefined)

export function TimeRangeProvider({ children }: { readonly children: React.ReactNode }) {
  const [timeRange, setTimeRangeState] = useState<number>(0)

  useEffect(() => {
    // Load time range from localStorage on mount
    const stored = localStorage.getItem('timeRange')
    if (stored !== null) {
      setTimeRangeState(Number(stored))
    }
  }, [])

  const setTimeRange = (range: number) => {
    setTimeRangeState(range)
    localStorage.setItem('timeRange', range.toString())
  }

  return <TimeRangeContext.Provider value={{ timeRange, setTimeRange }}>{children}</TimeRangeContext.Provider>
}

export function useTimeRange() {
  const context = useContext(TimeRangeContext)
  if (context === undefined) {
    throw new Error('useTimeRange must be used within a TimeRangeProvider')
  }
  return context
}
