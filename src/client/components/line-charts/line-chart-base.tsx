import React from 'react'
import { Card } from '@/client/components/ui/card'
import { ResponsiveChartContainer, ResponsiveChartContainerProps } from '@mui/x-charts/ResponsiveChartContainer'
import { ChartsGrid } from '@mui/x-charts/ChartsGrid'
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine'
import { ChartsLegend, ChartsLegendProps } from '@mui/x-charts/ChartsLegend'

type Props = {
  id: string
  referenceLineValue?: number
  referenceLineLabel?: string
}

export default function LineChart(props: ResponsiveChartContainerProps & ChartsLegendProps & Props) {
  const { referenceLineValue, referenceLineLabel, onItemClick, id } = props

  return (
    <Card className='border-border-card bg-card h-96 w-full border p-3 shadow-none' data-testid={id}>
      <ResponsiveChartContainer {...props}>
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
        <ChartsLegend
          onItemClick={onItemClick}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'top', horizontal: 'middle' },
              padding: 0,
            },
          }}
        />
        <ChartsTooltip trigger='item' />
        <ChartsGrid horizontal vertical />
      </ResponsiveChartContainer>
    </Card>
  )
}
