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

type Props = Readonly<{
  percentage: number
  invert?: boolean
  title: string
  onClick?: () => void
  warningAt?: number
  lowAt?: number
}>

export default function Gauge({ percentage, invert, title, onClick, warningAt, lowAt }: Props) {
  const { resolvedTheme } = useTheme()
  const data = [
    { percentage, fill: 'var(--color-percentage)', stroke: 'var(--primary-foreground)' },
    { percentage: 100 - percentage, fill: 'var(--border-card)' },
  ]

  const chartConfig = {
    percentage: {
      label: title,
      color: getColor(percentage, resolvedTheme, invert),
    },
  } satisfies ChartConfig

  const innerR = 85
  const outerR = 105

  const renderMarker = (cx: number, cy: number, pct: number, color: string, label?: string) => {
    const angleDeg = -180 + (Math.max(0, Math.min(100, pct)) / 100) * 180
    const angleRad = (Math.PI / 180) * angleDeg
    const r1 = innerR
    const r2 = outerR
    const x1 = cx + r1 * Math.cos(angleRad)
    const y1 = cy + r1 * Math.sin(angleRad)
    const x2 = cx + r2 * Math.cos(angleRad)
    const y2 = cy + r2 * Math.sin(angleRad)

    // Calculate label position
    const labelR = outerR + 15
    const labelX = cx + labelR * Math.cos(angleRad)
    const labelY = cy + labelR * Math.sin(angleRad)

    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} />
        {label && (
          <text
            x={labelX}
            y={labelY}
            textAnchor='middle'
            dominantBaseline='middle'
            fill={color}
            fontSize='12'
            fontWeight='bold'
          >
            {label}
          </text>
        )}
      </g>
    )
  }

  return (
    <Card
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyUp={(e) => {
        if (e.key === 'Enter' && onClick) {
          onClick()
        }
      }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className='border-border-card bg-card h-52 min-w-56 cursor-pointer overflow-hidden border py-0 shadow-none'
      data-testid='gauge'
    >
      <CardContent className='h-36 !px-0 !py-0'>
        <div className='motion-safe:animate-fade'>
          <ChartContainer config={chartConfig} className='mx-auto aspect-square h-full w-full max-w-[280px]'>
            <PieChart>
              <Pie
                data={data}
                dataKey='percentage'
                startAngle={-180}
                endAngle={-360}
                innerRadius={innerR}
                outerRadius={outerR}
                isAnimationActive={false}
              >
                <Label
                  content={({ viewBox }) => {
                    const cx = viewBox && 'cx' in viewBox && viewBox.cx !== undefined ? viewBox.cx : 140
                    const cy = viewBox && 'cy' in viewBox && viewBox.cy !== undefined ? viewBox.cy : 140
                    return (
                      <g>
                        {typeof warningAt === 'number' && renderMarker(cx, cy, warningAt, '#f59e0b', `${warningAt}%`)}
                        {typeof lowAt === 'number' && renderMarker(cx, cy, lowAt, '#ef4444', `${lowAt}%`)}
                        <text x={cx} y={cy - 10} textAnchor='middle'>
                          <tspan x={cx} y={cy - 10} className='fill-foreground text-5xl'>
                            {percentage}%
                          </tspan>
                        </text>
                      </g>
                    )
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className='text-muted-foreground motion-safe:animate-fade w-full justify-center text-xs font-semibold'>
        {title}
      </CardFooter>
    </Card>
  )
}
