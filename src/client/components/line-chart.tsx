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
  const prevDataRef = useRef(id)

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
            data: inputVoltageData,
            label: t('lineChart.inputVoltage'),
            type: 'line',
            valueFormatter: (v) => (v === null ? '' : `${v}V`),
          },
          {
            data: outputVoltageData,
            label: t('lineChart.outputVoltage'),
            type: 'line',
            valueFormatter: (v) => (v === null ? '' : `${v}V`),
          },
        ]}
        xAxis={[{ scaleType: 'point', data: inputVoltageData.map((value, index) => index) }]}
        yAxis={[
          {
            scaleType: 'linear',
            valueFormatter: (value: number) => `${value}V`,
          },
        ]}
      >
        <LinePlot />
        <MarkPlot />
        {inputVoltageNominal && (
          <ChartsReferenceLine
            y={inputVoltageNominal}
            label={t('lineChart.nominalInputVoltage')}
            lineStyle={{ stroke: 'red', strokeDasharray: '10 5' }}
          />
        )}
        <ChartsXAxis disableTicks disableLine tickLabelStyle={{ display: 'none' }} />
        <ChartsYAxis />
        <ChartsLegend />
        <ChartsTooltip trigger='item' />
        <ChartsGrid horizontal vertical />
      </ResponsiveChartContainer>
    </Card>
  )
}
