import { useEffect, useState, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { Card } from '@material-tailwind/react'

import { useTranslation } from 'react-i18next'
import { DEVICE } from '@/common/types'

type Props = {
  data: DEVICE
  lng: string
}

export default function LineChart(props: Props) {
  const { data } = props
  const { t } = useTranslation(props.lng)
  const [inputVoltage, setInputVoltage] = useState([data['input.voltage']])
  const [outputVoltage, setOutputVoltage] = useState([data['output.voltage']])
  const prevDataRef = useRef(data)

  useEffect(() => {
    const input = data['input.voltage']
    const output = data['output.voltage']
    if (data['device.serial'] !== prevDataRef.current['device.serial']) {
      setInputVoltage([input, input, input])
      setOutputVoltage([output, output, output])
    } else {
      setInputVoltage((prev: Array<number>) => (Number.isNaN(input) ? prev : [...prev, input]))
      setOutputVoltage((prev: Array<number>) => (Number.isNaN(output) ? prev : [...prev, output]))
    }
    prevDataRef.current = data
  }, [data])

  return (
    <Card className='border-neutral-300 h-96 w-full border border-solid border-gray-300 p-3 shadow-none dark:border-gray-800 dark:bg-gray-950'>
      <Line
        className='dark:hue-rotate-180 dark:invert'
        data={{
          labels: inputVoltage.map(() => ''),
          datasets: [
            {
              label: t('lineChart.inputVoltage'),
              data: inputVoltage,
              fill: false,
              borderColor: 'rgb(8, 143, 143)',
              tension: 0.1,
            },
            {
              label: t('lineChart.outputVoltage'),
              data: outputVoltage,
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
                  value: data['input.voltage.nominal'],
                },
              },
            },
          },
        }}
      />
    </Card>
  )
}
