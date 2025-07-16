import { useEffect, useRef, useState } from 'react'
import { useTimeRange } from '@/client/context/time-range'

type DataPoint = {
  dataPoint: number
  time: Date
}

export function useChartData(id: string, updated: Date, value?: number) {
  const [data, setData] = useState<DataPoint[]>([])
  const prevDataRef = useRef(id)
  const { timeRange } = useTimeRange()

  useEffect(() => {
    if (id !== prevDataRef.current) {
      if (value) {
        setData([{ dataPoint: value, time: new Date() }])
      } else {
        setData([])
      }
    } else if (value) {
      setData((prev) => [...prev, { dataPoint: value, time: new Date() }])
    }
    prevDataRef.current = id
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
