import React, { useEffect, useState, useRef, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import LineChart from './line-chart-base'

type Props = {
  id: string
  realpower?: number
  realpowerNominal?: number
  updated: Date
}

export default function WattsChart(props: Props) {
  const { id, realpower, realpowerNominal, updated } = props
  const [dataPoints, setDataPoints] = useState<Array<number>>([])
  const [showRealPower, setShowRealPower] = useState<boolean>(true)
  const prevDataRef = useRef(id)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const handleLegendClick = (id: string | number) => {
    const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>, selector: string) => {
      setter((prev) => {
        document.querySelector(selector)?.setAttribute('style', `text-decoration: ${prev ? 'line-through' : 'none'}`)
        return !prev
      })
    }

    if (id === 'realPower') {
      toggleVisibility(setShowRealPower, `.MuiChartsLegend-series-${id}`)
    }
  }

  useEffect(() => {
    if (id !== prevDataRef.current) {
      if (realpower) setDataPoints([realpower])
      else setDataPoints([])
    } else {
      if (realpower) setDataPoints((prev: Array<number>) => [...prev, realpower])
    }
    prevDataRef.current = id
  }, [id, realpower, updated])

  return (
    <LineChart
      id='watts-chart'
      onItemClick={(e, context) => handleLegendClick(context.seriesId)}
      referenceLineValue={realpowerNominal}
      referenceLineLabel={t('wattsChart.nominalRealpower')}
      series={[
        {
          id: 'realPower',
          data: showRealPower ? dataPoints : [],
          label: t('wattsChart.realpower'),
          type: 'line',
          color: 'rgb(75, 192, 192)',
          valueFormatter: (v) => (v === null ? '' : `${v}W`),
        },
      ]}
      xAxis={[{ scaleType: 'point', data: dataPoints.map((value, index) => index) }]}
      yAxis={[
        {
          domainLimit: (min: number, max: number) => {
            return {
              min: realpowerNominal ? Math.min(min, realpowerNominal) : min,
              max: realpowerNominal ? Math.max(max, realpowerNominal) : max,
            }
          },
          valueFormatter: (value: number) => `${value}W`,
        },
      ]}
    />
  )
}
