import React, { useContext } from 'react'
import { Gauge as GaugeChart, gaugeClasses } from '@mui/x-charts/Gauge'
import { Card } from '@material-tailwind/react'
import { ThemeContext } from '@/client/context/theme'

const getColor = (value: number, theme: 'light' | 'dark', invert = false) => {
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
  const { theme: systemTheme } = useContext(ThemeContext)

  return (
    <Card
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className='border-neutral-300 relative flex h-52 flex-row justify-around border border-solid border-gray-300 text-center shadow-none dark:border-gray-800 dark:bg-gray-950'
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
            [`& .${gaugeClasses.valueText} text`]: {
              fill: systemTheme === 'light' ? '#000' : '#fff',
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: getColor(percentage, systemTheme, invert),
              stroke: systemTheme === 'light' ? '#fff' : '#000',
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: systemTheme === 'light' ? '#cccccc' : '#363941',
            },
          }}
        />
      </div>
      <div className='absolute bottom-[9px] w-full text-xs font-semibold text-[#666666] motion-safe:animate-fade dark:text-[#999999]'>
        {title}
      </div>
    </Card>
  )
}
