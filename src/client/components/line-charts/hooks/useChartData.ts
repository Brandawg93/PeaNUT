import { useEffect, useRef, useState } from 'react'
import { useTimeRange } from '@/client/context/time-range'
import { useInfluxConfig } from '@/client/context/settings'
import { getInfluxHistory } from '@/app/actions'

type DataPoint = {
  dataPoint: number
  time: Date
}

export function useChartData(id: string, field: string, updated: Date, value?: number) {
  const [data, setData] = useState<DataPoint[]>([])
  const { timeRange } = useTimeRange()
  const { isConfigured: influxConfigured } = useInfluxConfig()
  const seedKeyRef = useRef<string | null>(null)
  // Tracks the `updated` value data was last seeded/appended for, so the live-append
  // effect (below) doesn't double-count the point the seeding effect just loaded.
  const lastAppendedUpdatedRef = useRef(updated)

  // (Re)seed the series whenever its identity or the selected time range changes: pull
  // real history from InfluxDB when it's configured, otherwise fall back to starting
  // from just the current value (previous behavior for users without InfluxDB set up).
  useEffect(() => {
    const seedKey = `${id}:${field}:${timeRange}:${influxConfigured}`
    if (seedKeyRef.current === seedKey) return
    seedKeyRef.current = seedKey

    let cancelled = false
    lastAppendedUpdatedRef.current = updated

    if (influxConfigured) {
      getInfluxHistory(id, field, timeRange)
        .then((history) => {
          if (cancelled) return
          setData(history.map((p) => ({ dataPoint: p.value, time: new Date(p.time) })))
        })
        .catch(() => {
          if (!cancelled) {
            setData(value === undefined ? [] : [{ dataPoint: value, time: new Date() }])
          }
        })
    } else {
      // Schedule state update to avoid synchronous setState in effect
      queueMicrotask(() => {
        setData(value === undefined ? [] : [{ dataPoint: value, time: new Date() }])
      })
    }

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, field, timeRange, influxConfigured])

  // Append newly-observed live values as they arrive.
  useEffect(() => {
    if (lastAppendedUpdatedRef.current === updated) return
    lastAppendedUpdatedRef.current = updated
    if (value === undefined) return
    // Schedule state update to avoid synchronous setState in effect
    queueMicrotask(() => {
      setData((prev) => [...prev, { dataPoint: value, time: new Date() }])
    })
  }, [updated, value])

  // Filter data based on time range
  const filteredData = data.filter((point) => {
    if (timeRange === 0) return true // Show all data

    const cutoffTime = new Date()
    cutoffTime.setMinutes(cutoffTime.getMinutes() - timeRange)

    return point.time >= cutoffTime
  })

  return filteredData
}
