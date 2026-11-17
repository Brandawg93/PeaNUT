import React, { useMemo, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import LineChart from './line-chart-base'
import type { LegendPayload } from 'recharts'
import { useChartData } from './hooks/useChartData'
import { BaseChartProps } from './types/chart-types'
import { useTemperatureUnit } from '@/client/context/settings'

type Temperatures = {
  ambientTemperature?: number
  batteryTemperature?: number
  upsTemperature?: number
}

type Props = Readonly<
  BaseChartProps & {
    ambientTemperature?: string | number
    batteryTemperature?: string | number
    upsTemperature?: string | number
  }
>

const temperatureKeys = ['ambientTemperature', 'batteryTemperature', 'upsTemperature'] as const

function validTemperature(value?: string | number): number | undefined {
  if (value === undefined || (typeof value === 'string' && value.trim() === '')) return undefined
  const temperature = Number(value)
  // Some NUT drivers report -1 when a temperature sensor is unavailable.
  return Number.isFinite(temperature) && temperature !== -1 ? temperature : undefined
}

const convertTemperature = (value: number, unit: 'celsius' | 'fahrenheit') =>
  unit === 'fahrenheit' ? Math.round((value * (9 / 5) + 32) * 10) / 10 : value

export default function TemperatureChart({
  id,
  updated,
  ambientTemperature,
  batteryTemperature,
  upsTemperature,
}: Props) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const temperatureUnit = useTemperatureUnit()
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([])

  const temperatures = useMemo<Temperatures>(
    () => ({
      ambientTemperature: validTemperature(ambientTemperature),
      batteryTemperature: validTemperature(batteryTemperature),
      upsTemperature: validTemperature(upsTemperature),
    }),
    [ambientTemperature, batteryTemperature, upsTemperature]
  )
  // Record all sensors together so missing readings leave gaps at the correct time.
  const temperatureData = useChartData(id, updated, temperatures)
  const availableSeries = temperatureKeys.filter((key) =>
    temperatureData.some(({ dataPoint }) => dataPoint[key] !== undefined)
  )

  const chartData = temperatureData.map(({ time, dataPoint }) => ({
    time,
    ...Object.fromEntries(
      availableSeries.map((key) => [
        key,
        !hiddenSeries.includes(key) && dataPoint[key] !== undefined
          ? convertTemperature(dataPoint[key], temperatureUnit)
          : undefined,
      ])
    ),
  }))

  const handleLegendClick = (payload: LegendPayload) => {
    const key = payload.value
    if (typeof key !== 'string') return
    setHiddenSeries((prev) => (prev.includes(key) ? prev.filter((value) => value !== key) : [...prev, key]))
  }

  if (availableSeries.length === 0) return null

  return (
    <LineChart
      id='temperature-chart'
      showDots
      onLegendClick={handleLegendClick}
      config={{
        time: { label: 'Time' },
        ...Object.fromEntries(
          availableSeries.map((key) => [
            key,
            {
              label: t(`temperatureChart.${key}`),
              color: `var(--chart-${temperatureKeys.indexOf(key) + 1})`,
            },
          ])
        ),
      }}
      unit={temperatureUnit === 'fahrenheit' ? '°F' : '°C'}
      data={chartData}
    />
  )
}
