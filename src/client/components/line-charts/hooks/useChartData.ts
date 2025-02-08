import { useEffect, useRef, useState } from 'react'

type DataPoint = {
  dataPoint: number
  time: Date
}

export function useChartData(id: string, updated: Date, value?: number) {
  const [data, setData] = useState<DataPoint[]>([])
  const prevDataRef = useRef(id)

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

  return data
}
