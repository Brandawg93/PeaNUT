import React from 'react'
import { Gauge as GaugeChart, gaugeClasses } from '@mui/x-charts/Gauge'
import { Card } from '@/client/components/ui/card'
import { useTheme } from 'next-themes'

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

  return (
    <Card
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className='relative flex h-52 flex-row justify-around border border-border-card bg-card text-center shadow-none'
      data-testid='gauge'
    >
      <div className='motion-safe:animate-fade'>
        <GaugeChart
          width={225}
          height={175}
          value={percentage}
          startAngle={-90}
          endAngle={90}
          text={({ value }) => `${value}%`}
          sx={{
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 45,
              fontFamily: 'sans-serif',
              transform: 'translate(0, -15%)',
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: getColor(percentage, resolvedTheme, invert),
              stroke: 'hsl(var(--primary-foreground))',
            },
          }}
        />
      </div>
      <div className='absolute bottom-[9px] w-full text-xs font-semibold text-muted-foreground motion-safe:animate-fade'>
        {title}
      </div>
    </Card>
  )
}
