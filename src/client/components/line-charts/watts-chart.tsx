import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import './charts.css'
import LineChart from './line-chart-base'
import { Payload } from 'recharts/types/component/DefaultLegendContent'
import { useChartData } from './hooks/useChartData'
import { BaseChartProps } from './types/chart-types'

type Props = BaseChartProps & {
  realpower?: number
  realpowerNominal?: number
}

export default function WattsChart(props: Props) {
  const { id, realpower, realpowerNominal, updated } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [showRealpower, setShowRealpower] = useState<boolean>(true)
  const realpowerData = useChartData(id, updated, realpower)

  const referenceLineData = realpowerNominal
    ? [{ label: t('wattsChart.nominalRealpower'), value: realpowerNominal }]
    : []

  const handleLegendClick = (payload: Payload) => {
    if (payload.value === 'realpower') {
      setShowRealpower(!showRealpower)
    }
  }

  return (
    <LineChart
      id='watts-chart'
      onLegendClick={handleLegendClick}
      referenceLineData={referenceLineData}
      config={{
        time: {
          label: 'Time',
        },
        realpower: {
          label: t('wattsChart.realpower'),
          color: 'var(--chart-1)',
        },
      }}
      unit='W'
      data={realpowerData.map((v) => ({
        time: v.time,
        realpower: showRealpower ? v.dataPoint : undefined,
      }))}
    />
  )
}
