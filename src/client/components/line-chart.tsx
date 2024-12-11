import React, { useEffect, useState, useRef, useContext } from 'react'
import { Line } from 'react-chartjs-2'
import { Card } from '@material-tailwind/react'

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
      <Line
        className='dark:hue-rotate-180 dark:invert'
        data={{
          labels: inputVoltageData.map(() => ''),
          datasets: [
            {
              label: t('lineChart.inputVoltage'),
              data: inputVoltageData,
              fill: false,
              borderColor: 'rgb(8, 143, 143)',
              tension: 0.1,
            },
            {
              label: t('lineChart.outputVoltage'),
              data: outputVoltageData,
              fill: false,
              borderColor: 'rgb(255, 83, 73)',
              tension: 0.1,
            },
            {
              label: t('lineChart.nominalInputVoltage'),
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
          scales: {
            y: {
              ticks: {
                callback: (tickValue: string | number) => `${tickValue}V`,
              },
            },
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
                  value: inputVoltageNominal,
                },
              },
            },
          },
        }}
      />
    </Card>
  )
}
