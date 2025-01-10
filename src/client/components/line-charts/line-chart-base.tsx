import React from 'react'
import { Card } from '@material-tailwind/react'
import { ResponsiveChartContainer, ResponsiveChartContainerProps } from '@mui/x-charts/ResponsiveChartContainer'
import { ChartsGrid } from '@mui/x-charts/ChartsGrid'
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine'
import { ChartsLegend, ChartsLegendProps } from '@mui/x-charts/ChartsLegend'

const CHART_HEIGHT = 300

type Props = {
  id: string
  referenceLineValue?: number
  referenceLineLabel?: string
}

export default function LineChart(props: ResponsiveChartContainerProps & ChartsLegendProps & Props) {
  const { referenceLineValue, referenceLineLabel, onItemClick, id } = props

  return (
    <Card
      className='border-neutral-300 h-96 w-full border border-solid border-gray-300 p-3 shadow-none dark:border-gray-800 dark:bg-gray-950'
      data-testid={id}
    >
      <ResponsiveChartContainer height={CHART_HEIGHT} {...props}>
        <LinePlot />
        <MarkPlot />
        {referenceLineValue && (
          <ChartsReferenceLine
            y={referenceLineValue}
            label={referenceLineLabel}
            lineStyle={{ stroke: 'red', strokeDasharray: '10 5' }}
          />
        )}
        <ChartsXAxis disableTicks disableLine tickLabelStyle={{ display: 'none' }} />
        <ChartsYAxis />
        <ChartsLegend onItemClick={onItemClick} />
        <ChartsTooltip trigger='item' />
        <ChartsGrid horizontal vertical />
      </ResponsiveChartContainer>
    </Card>
  )
}
