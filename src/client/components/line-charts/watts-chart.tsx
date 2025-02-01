import React, { useEffect, useState, useRef, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import './charts.css'
import LineChart from './line-chart-base'
import { Payload } from 'recharts/types/component/DefaultLegendContent'

type Props = {
  id: string
  realpower?: number
  realpowerNominal?: number
  updated: Date
}

export default function WattsChart(props: Props) {
  const { id, realpower, realpowerNominal, updated } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [realpowerData, setRealpowerData] = useState<Array<{ dataPoint: number; time: Date }>>([])
  const [showRealpower, setShowRealpower] = useState<boolean>(true)
  const prevDataRef = useRef(id)

  const handleLegendClick = (payload: Payload) => {
    if (payload.value === 'realpower') {
      setShowRealpower(!showRealpower)
    }
  }

  useEffect(() => {
    if (id !== prevDataRef.current) {
      if (realpower) setRealpowerData([{ dataPoint: realpower, time: new Date() }])
      else setRealpowerData([])
    } else {
      if (realpower) setRealpowerData((prev) => [...prev, { dataPoint: realpower, time: new Date() }])
    }
    prevDataRef.current = id
  }, [id, realpower, updated])

  return (
    <LineChart
      id='watts-chart'
      onLegendClick={handleLegendClick}
      referenceLineValue={realpowerNominal}
      referenceLineLabel={t('wattsChart.nominalRealpower')}
      config={{
        time: {
          label: 'Time',
        },
        inputVoltage: {
          label: t('wattsChart.realpower'),
          color: 'hsl(var(--chart-1))',
        },
      }}
      unit='W'
      data={realpowerData.map((v) => ({
        time: v.time,
        inputVoltage: showRealpower ? v.dataPoint : undefined,
      }))}
    />
  )
}
