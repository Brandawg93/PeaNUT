import React, { useEffect, useState, useRef, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import './charts.css'
import LineChart from './line-chart-base'

type Props = {
  id: string
  inputVoltage?: number
  inputVoltageNominal?: number
  outputVoltage?: number
  updated: Date
}

export default function VoltsChart(props: Props) {
  const { id, inputVoltage, inputVoltageNominal, outputVoltage, updated } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [inputVoltageData, setInputVoltageData] = useState<Array<number>>([])
  const [outputVoltageData, setOutputVoltageData] = useState<Array<number>>([])
  const [showInputVoltage, setShowInputVoltage] = useState<boolean>(true)
  const [showOutputVoltage, setShowOutputVoltage] = useState<boolean>(true)
  const prevDataRef = useRef(id)

  const handleLegendClick = (id: string | number) => {
    const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>, selector: string) => {
      setter((prev) => {
        document.querySelector(selector)?.setAttribute('style', `text-decoration: ${prev ? 'line-through' : 'none'}`)
        return !prev
      })
    }

    if (id === 'inputVoltage') {
      toggleVisibility(setShowInputVoltage, `.MuiChartsLegend-series-${id}`)
    } else if (id === 'outputVoltage') {
      toggleVisibility(setShowOutputVoltage, `.MuiChartsLegend-series-${id}`)
    }
  }

  useEffect(() => {
    if (id !== prevDataRef.current) {
      if (inputVoltage) setInputVoltageData([inputVoltage])
      else setInputVoltageData([])
      if (outputVoltage) setOutputVoltageData([outputVoltage])
      else setOutputVoltageData([])
    } else {
      if (inputVoltage) setInputVoltageData((prev: Array<number>) => [...prev, inputVoltage])
      if (outputVoltage) setOutputVoltageData((prev: Array<number>) => [...prev, outputVoltage])
    }
    prevDataRef.current = id
  }, [id, inputVoltage, outputVoltage, updated])

  return (
    <LineChart
      id='volts-chart'
      onItemClick={(e, context) => handleLegendClick(context.seriesId)}
      referenceLineValue={inputVoltageNominal}
      referenceLineLabel={t('voltsChart.nominalInputVoltage')}
      series={[
        {
          id: 'inputVoltage',
          data: showInputVoltage ? inputVoltageData : [],
          label: t('voltsChart.inputVoltage'),
          type: 'line',
          color: 'rgb(75, 192, 192)',
          valueFormatter: (v) => (v === null ? '' : `${v}V`),
        },
        {
          id: 'outputVoltage',
          data: showOutputVoltage ? outputVoltageData : [],
          label: t('voltsChart.outputVoltage'),
          type: 'line',
          color: 'rgb(255 99 132)',
          valueFormatter: (v) => (v === null ? '' : `${v}V`),
        },
      ]}
      xAxis={[{ scaleType: 'point', data: inputVoltageData.map((value, index) => index) }]}
      yAxis={[
        {
          domainLimit: (min: number, max: number) => {
            return {
              min: inputVoltageNominal ? Math.min(min, inputVoltageNominal) : min,
              max: inputVoltageNominal ? Math.max(max, inputVoltageNominal) : max,
            }
          },
          valueFormatter: (value: number) => `${value}V`,
        },
      ]}
    />
  )
}
