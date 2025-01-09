import React, { useEffect, useState, useRef, useContext } from 'react'
import { Card } from '@material-tailwind/react'
import { ResponsiveChartContainer } from '@mui/x-charts/ResponsiveChartContainer'
import { ChartsLegend } from '@mui/x-charts/ChartsLegend'
import { ChartsGrid } from '@mui/x-charts/ChartsGrid'
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine'
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import './charts.css'

type Props = {
  id: string
  inputVoltage?: number
  inputVoltageNominal?: number
  outputVoltage?: number
  updated: Date
}

export default function LineChart(props: Props) {
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
    <Card
      className='border-neutral-300 h-96 w-full border border-solid border-gray-300 p-3 shadow-none dark:border-gray-800 dark:bg-gray-950'
      data-testid='line'
    >
      <ResponsiveChartContainer
        height={300}
        series={[
          {
            id: 'inputVoltage',
            data: showInputVoltage ? inputVoltageData : [],
            label: t('lineChart.inputVoltage'),
            type: 'line',
            color: 'rgb(75, 192, 192)',
            valueFormatter: (v) => (v === null ? '' : `${v}V`),
          },
          {
            id: 'outputVoltage',
            data: showOutputVoltage ? outputVoltageData : [],
            label: t('lineChart.outputVoltage'),
            type: 'line',
            color: 'rgb(255 99 132)',
            valueFormatter: (v) => (v === null ? '' : `${v}V`),
          },
          {
            id: 'nominalInputVoltage',
            data: [],
            label: t('lineChart.nominalInputVoltage'),
            type: 'line',
          },
        ]}
        xAxis={[{ scaleType: 'point', data: inputVoltageData.map((value, index) => index) }]}
        yAxis={[
          {
            valueFormatter: (value: number) => `${value}V`,
          },
        ]}
      >
        <LinePlot />
        <MarkPlot />
        {inputVoltageNominal && (
          <ChartsReferenceLine y={inputVoltageNominal} lineStyle={{ stroke: 'red', strokeDasharray: '10 5' }} />
        )}
        <ChartsXAxis disableTicks disableLine tickLabelStyle={{ display: 'none' }} />
        <ChartsYAxis />
        <ChartsLegend onItemClick={(e, context) => handleLegendClick(context.seriesId)} />
        <ChartsTooltip trigger='item' />
        <ChartsGrid horizontal vertical />
      </ResponsiveChartContainer>
    </Card>
  )
}
