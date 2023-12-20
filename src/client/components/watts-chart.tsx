import { useEffect, useState, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { Card } from '@material-tailwind/react'

export default function WattsChart(props: any) {
  const { data } = props
  const [realpower, setRealPower] = useState([parseInt(data?.ups_realpower, 10)])
  const prevDataRef = useRef(data)

  useEffect(() => {
    const input = parseInt(data?.ups_realpower, 10)
    if (data.device_serial !== prevDataRef.current.device_serial) {
      setRealPower([input, input, input])
    } else {
      setRealPower((prev: any) => (Number.isNaN(input) ? prev : [...prev, input]))
    }
    prevDataRef.current = data
  }, [data])

  return (
    <Card className='border-neutral-300 h-96 w-full border border-solid p-3 shadow-none dark:bg-gray-950 border-gray-300 dark:border-gray-800'>
      <Line
        data={{
          labels: realpower.map(() => ''),
          datasets: [
            {
              label: 'Realpower',
              data: realpower,
              fill: false,
              borderColor: 'rgb(8, 143, 143)',
              tension: 0.1,
            },
            {
              label: 'Nominal Realpower',
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
                  value: parseInt(data?.ups_realpower_nominal, 10),
                },
              },
            },
          },
        }}
      />
    </Card>
  )
}
