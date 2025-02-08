import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import './charts.css'
import LineChart from './line-chart-base'
import { Payload } from 'recharts/types/component/DefaultLegendContent'
import { useChartData } from './hooks/useChartData'
import { BaseChartProps } from './types/chart-types'

type Props = BaseChartProps & {
  power?: number
  powerNominal?: number
}

export default function VoltAmpsChart(props: Props) {
  const { id, power, powerNominal, updated } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [showPower, setShowPower] = useState<boolean>(true)
  const powerData = useChartData(id, updated, power)

  const referenceLineData = powerNominal ? [{ label: t('voltAmpsChart.nominalPower'), value: powerNominal }] : []

  const handleLegendClick = (payload: Payload) => {
    if (payload.value === 'power') {
      setShowPower(!showPower)
    }
  }

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
