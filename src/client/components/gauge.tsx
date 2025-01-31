import React from 'react'
import { ChartConfig, ChartContainer } from '@/client/components/ui/chart'
import { Label, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardFooter } from '@/client/components/ui/card'
import { useTheme } from 'next-themes'
import './gauge.css'

const getColor = (value: number, theme?: string, invert = false) => {
  // value from 0 to 1
  let num = value / 100
  if (invert) {
    num = 1 - num
  }
  const hue = (num * 120).toString(10)
  return `hsl(${hue}, 100%, ${theme === 'light' ? 40 : 20}%)`
}

type Props = {
  percentage: number
  invert?: boolean
  title: string
  onClick?: () => void
}

export default function Gauge(props: Props) {
  const { percentage, invert, title, onClick } = props
  const { resolvedTheme } = useTheme()
  const data = [
    { percentage, fill: 'var(--color-percentage)', stroke: 'hsl(var(--primary-foreground))' },
    { percentage: 100 - percentage, fill: 'hsl(var(--border-card))' },
  ]

  const chartConfig = {
    percentage: {
      label: title,
      color: getColor(percentage, resolvedTheme, invert),
    },
  } satisfies ChartConfig

  return (
    <Card
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className='h-52 min-w-56 cursor-pointer overflow-hidden border border-border-card bg-card shadow-none'
      data-testid='gauge'
    >
      <CardContent className='h-44 !p-0'>
        <div className='motion-safe:animate-fade'>
          <ChartContainer config={chartConfig} className='mx-auto aspect-square h-full w-full max-w-[280px]'>
            <PieChart>
              <Pie
                data={data}
                dataKey='percentage'
                startAngle={-180}
                endAngle={-360}
                innerRadius={85}
                outerRadius={105}
                isAnimationActive={false}
              >
                <Label
                  content={({ viewBox }) => {
                    if (
                      viewBox &&
                      'cx' in viewBox &&
                      viewBox.cx !== undefined &&
                      'cy' in viewBox &&
                      viewBox.cy !== undefined
                    ) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy - 10} textAnchor='middle'>
                          <tspan x={viewBox.cx} y={viewBox.cy - 10} className='fill-foreground text-5xl'>
                            {percentage}%
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className='w-full justify-center text-xs font-semibold text-muted-foreground motion-safe:animate-fade'>
        {title}
      </CardFooter>
    </Card>
  )
}
