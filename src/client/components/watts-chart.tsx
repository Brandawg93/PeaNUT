import { useEffect, useState, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { Card } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import { DEVICE } from '@/common/types'

type Props = {
  data: DEVICE
  lng: string
}

export default function WattsChart(props: Props) {
  const { data } = props
  const [realpower, setRealPower] = useState([data['ups.realpower']])
  const prevDataRef = useRef(data)
  const { t } = useTranslation(props.lng)

  useEffect(() => {
    const input = data['ups.realpower']
    if (data['device.serial'] !== prevDataRef.current['device.serial']) {
      setRealPower([input, input, input])
    } else {
      setRealPower((prev: Array<number>) => (Number.isNaN(input) ? prev : [...prev, input]))
    }
    prevDataRef.current = data
  }, [data])

  return (
    <Card className='border-neutral-300 h-96 w-full border border-solid border-gray-300 p-3 shadow-none dark:border-gray-800 dark:bg-gray-950'>
      <Line
        className='dark:hue-rotate-180 dark:invert'
        data={{
          labels: realpower.map(() => ''),
          datasets: [
            {
              label: t('wattsChart.realpower'),
              data: realpower,
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
                  value: data['ups.realpower.nominal'],
                },
              },
            },
          },
        }}
      />
    </Card>
  )
}
