import React, { useMemo, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import LineChart from './line-chart-base'
import { Payload } from 'recharts/types/component/DefaultLegendContent'
import { useChartData } from './hooks/useChartData'
import { BaseChartProps } from './types/chart-types'
import { useTemperatureUnit } from '@/client/context/settings'

type Props = Readonly<
  BaseChartProps & {
    ambientTemperature?: number
    batteryTemperature?: number
  }
>

const convertTemperature = (value: number, unit: 'celsius' | 'fahrenheit') =>
  unit === 'fahrenheit' ? Math.round((value * (9 / 5) + 32) * 10) / 10 : value

export default function TemperatureChart({ id, updated, ambientTemperature, batteryTemperature }: Props) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const temperatureUnit = useTemperatureUnit()
  const [showAmbient, setShowAmbient] = useState<boolean>(true)
  const [showBattery, setShowBattery] = useState<boolean>(true)

  const ambientTemperatureData = useChartData(id, updated, ambientTemperature)
  const batteryTemperatureData = useChartData(id, updated, batteryTemperature)

  const chartData = useMemo(() => {
    const maxLength = Math.max(ambientTemperatureData.length, batteryTemperatureData.length)
    return Array.from({ length: maxLength }).map((_, index) => {
      const ambientPoint = ambientTemperatureData[index]
      const batteryPoint = batteryTemperatureData[index]
      const time = ambientPoint?.time ?? batteryPoint?.time ?? new Date()

      return {
        time,
        ambientTemperature:
          showAmbient && ambientPoint ? convertTemperature(ambientPoint.dataPoint, temperatureUnit) : undefined,
        batteryTemperature:
          showBattery && batteryPoint ? convertTemperature(batteryPoint.dataPoint, temperatureUnit) : undefined,
      }
    })
  }, [ambientTemperatureData, batteryTemperatureData, showAmbient, showBattery, temperatureUnit])

  const handleLegendClick = (payload: Payload) => {
    if (payload.value === 'ambientTemperature') {
      setShowAmbient((prev) => !prev)
    } else if (payload.value === 'batteryTemperature') {
      setShowBattery((prev) => !prev)
    }
  }

  return (
    <LineChart
      id='temperature-chart'
      onLegendClick={handleLegendClick}
      config={{
        time: {
          label: 'Time',
        },
        ambientTemperature: {
          label: t('temperatureChart.ambientTemperature'),
          color: 'var(--chart-1)',
        },
        batteryTemperature: {
          label: t('temperatureChart.batteryTemperature'),
          color: 'var(--chart-2)',
        },
      }}
      unit={temperatureUnit === 'fahrenheit' ? '°F' : '°C'}
      data={chartData}
    />
  )
}
