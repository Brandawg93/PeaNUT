import React, { useEffect, useState, useRef, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import './charts.css'
import LineChart from './line-chart-base'
import { Payload } from 'recharts/types/component/DefaultLegendContent'

type Props = {
  id: string
  power?: number
  powerNominal?: number
  updated: Date
}

export default function WattsChart(props: Props) {
  const { id, power, powerNominal, updated } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [powerData, setPowerData] = useState<Array<{ dataPoint: number; time: Date }>>([])
  const [showPower, setShowPower] = useState<boolean>(true)
  const prevDataRef = useRef(id)
  const referenceLineData = []
  if (powerNominal) {
    referenceLineData.push({ label: t('voltAmpsChart.nominalPower'), value: powerNominal })
  }

  const handleLegendClick = (payload: Payload) => {
    if (payload.value === 'power') {
      setShowPower(!showPower)
    }
  }

  useEffect(() => {
    if (id !== prevDataRef.current) {
      if (power) setPowerData([{ dataPoint: power, time: new Date() }])
      else setPowerData([])
    } else {
      if (power) setPowerData((prev) => [...prev, { dataPoint: power, time: new Date() }])
    }
    prevDataRef.current = id
  }, [id, power, updated])

  return (
    <LineChart
      id='volt-amps-chart'
      onLegendClick={handleLegendClick}
      referenceLineData={referenceLineData}
      config={{
        time: {
          label: 'Time',
        },
        power: {
          label: t('voltAmpsChart.power'),
          color: 'hsl(var(--chart-1))',
        },
      }}
      unit='VA'
      data={powerData.map((v) => ({
        time: v.time,
        power: showPower ? v.dataPoint : undefined,
      }))}
    />
  )
}
