import { useEffect, useRef, useState } from 'react'
import { useTimeRange } from '@/client/context/time-range'

type DataPoint = {
  dataPoint: number
  time: Date
}

export function useChartData(id: string, updated: Date, value?: number) {
  const [data, setData] = useState<DataPoint[]>([])
  const prevDataRef = useRef(id)
  const isFirstRender = useRef(true)
  const { timeRange } = useTimeRange()

  useEffect(() => {
    // Check if ID changed - reset data
    if (id !== prevDataRef.current) {
      prevDataRef.current = id
      isFirstRender.current = true
    }

    // On first render or ID change, initialize with current value
    if (isFirstRender.current) {
      isFirstRender.current = false
      // Schedule state update to avoid synchronous setState in effect
      queueMicrotask(() => {
        setData(value === undefined ? [] : [{ dataPoint: value, time: new Date() }])
      })
      return
    }

    // On subsequent renders, append data if we have a value
    if (value !== undefined) {
      // Schedule state update to avoid synchronous setState in effect
      queueMicrotask(() => {
        setData((prev) => [...prev, { dataPoint: value, time: new Date() }])
      })
    }
  }, [id, value, updated])

  // Filter data based on time range
  const filteredData = data.filter((point) => {
    if (timeRange === 0) return true // Show all data

    const cutoffTime = new Date()
    cutoffTime.setMinutes(cutoffTime.getMinutes() - timeRange)

    return point.time >= cutoffTime
  })

  return filteredData
}
