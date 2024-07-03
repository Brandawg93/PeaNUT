import React, { useEffect, useState, useRef, useContext } from 'react'
import { Line } from 'react-chartjs-2'
import { Card } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'

import { LanguageContext } from '@/client/context/language'

type Props = {
  serial: string | number
  realpower?: number
  realpowerNominal?: number
  updated: Date
}

export default function WattsChart(props: Props) {
  const { serial, realpower, realpowerNominal, updated } = props
  const [dataPoints, setDataPoints] = useState<Array<number>>([])
  const prevDataRef = useRef(serial)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  useEffect(() => {
    if (serial !== prevDataRef.current) {
      if (realpower) setDataPoints([realpower])
      else setDataPoints([])
    } else {
      if (realpower) setDataPoints((prev: Array<number>) => [...prev, realpower])
    }
    prevDataRef.current = serial
  }, [serial, realpower, updated])

  return (
    <Card
      className='border-neutral-300 h-96 w-full border border-solid border-gray-300 p-3 shadow-none dark:border-gray-800 dark:bg-gray-950'
      data-testid='watts'
    >
      <Line
        className='dark:hue-rotate-180 dark:invert'
        data={{
          labels: dataPoints.map(() => ''),
          datasets: [
            {
              label: t('wattsChart.realpower'),
              data: dataPoints,
              fill: false,
              borderColor: 'rgb(8, 143, 143)',
              tension: 0.1,
            },
            {
              label: t('wattsChart.nominalRealpower'),
              data: [],
              borderColor: 'black',
              borderDash: [6, 6],
              borderDashOffset: 0,
              borderWidth: 3,
              backgroundColor: 'rgb(0, 0, 0, 0)',
            },
          ],
        }}
        options={{
          animation: {
            duration: window.matchMedia('(prefers-reduced-motion: no-preference)').matches ? 1000 : 0,
          },
          maintainAspectRatio: false,
          plugins: {
            annotation: {
              annotations: {
                nominal: {
                  type: 'line',
                  borderColor: 'black',
                  borderDash: [6, 6],
                  borderDashOffset: 0,
                  borderWidth: 3,
                  scaleID: 'y',
                  value: realpowerNominal,
                },
              },
            },
          },
        }}
      />
    </Card>
  )
}
