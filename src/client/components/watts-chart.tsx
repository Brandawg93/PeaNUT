import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import './line-chart.css'

export default function WattsChart(props: any) {
  const { data } = props
  const [realpower, setRealPower] = useState([parseInt(data?.ups_realpower, 10)])

  useEffect(() => {
    const input = parseInt(data?.ups_realpower, 10)
    setRealPower((prev: any) => (Number.isNaN(input) ? prev : [...prev, input]))
  }, [data])

  return (
    <div className="line-container">
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
    </div>
  )
}
