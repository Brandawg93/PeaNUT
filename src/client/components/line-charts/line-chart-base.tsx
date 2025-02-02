import React from 'react'
import { Card, CardContent } from '@/client/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartReferenceLine,
} from '@/client/components/ui/chart'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Payload } from 'recharts/types/component/DefaultLegendContent'

type ReferenceLineData = Array<{ label: string; value: number }>

type Props = {
  id: string
  config: ChartConfig
  data: any[]
  unit: string
  onLegendClick?: (payload: Payload) => void
  referenceLineData?: ReferenceLineData
}

export default function LineChartBase(props: Props) {
  const { referenceLineData, id, config, data, unit, onLegendClick } = props
  return (
    <Card className='h-96 w-full border border-border-card bg-card p-3 shadow-none' data-testid={id}>
      <CardContent className='h-full !p-0'>
        <ChartContainer config={config} className='mx-auto aspect-square h-full w-full'>
          <LineChart accessibilityLayer data={data}>
            <XAxis
              dataKey='time'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(timeStr) =>
                new Date(timeStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric' })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[
                (dataMin: number) =>
                  referenceLineData !== undefined
                    ? Math.min(dataMin, ...referenceLineData.map((l) => l.value))
                    : dataMin,
                (dataMax: number) =>
                  referenceLineData !== undefined
                    ? Math.max(dataMax, ...referenceLineData.map((l) => l.value))
                    : dataMax,
              ]}
              tickMargin={8}
              tickFormatter={(value) => `${value}${unit}`}
            />
            <ChartLegend
              verticalAlign='top'
              content={<ChartLegendContent handleClick={(e) => onLegendClick && onLegendClick(e)} />}
            />
            <CartesianGrid horizontal vertical />
            {referenceLineData &&
              referenceLineData.map((line) => (
                <ChartReferenceLine
                  key={line.label}
                  y={line.value}
                  stroke='red'
                  label={line.label}
                  strokeDasharray='4 4'
                />
              ))}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  unit={unit}
                  labelKey='time'
                  labelFormatter={(value, payload) =>
                    new Date(payload[0].payload.time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                    })
                  }
                />
              }
            />
            {data.length &&
              Object.keys(data[0])
                .filter((k) => k !== 'time')
                .map((key) => (
                  <Line
                    key={key}
                    dataKey={key}
                    type='monotone'
                    stroke={`var(--color-${key})`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
