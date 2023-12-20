import { useEffect, useState, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { Card } from '@material-tailwind/react'

export default function LineChart(props: any) {
  const { data } = props
  const [inputVoltage, setInputVoltage] = useState([parseInt(data?.input_voltage, 10)])
  const [outputVoltage, setOutputVoltage] = useState([parseInt(data?.output_voltage, 10)])
  const prevDataRef = useRef(data)

  useEffect(() => {
    const input = parseInt(data?.input_voltage, 10)
    const output = parseInt(data?.output_voltage, 10)
    if (data.device_serial !== prevDataRef.current.device_serial) {
      setInputVoltage([input, input, input])
      setOutputVoltage([output, output, output])
    } else {
      setInputVoltage((prev: any) => (Number.isNaN(input) ? prev : [...prev, input]))
      setOutputVoltage((prev: any) => (Number.isNaN(output) ? prev : [...prev, output]))
    }
    prevDataRef.current = data
  }, [data])

  return (
    <Card className='border-neutral-300 h-96 w-full border border-solid p-3 shadow-none dark:bg-gray-950 border-gray-300 dark:border-gray-800'>
      <Line
        data={{
          labels: inputVoltage.map(() => ''),
          datasets: [
            {
              label: 'Input Voltage',
              data: inputVoltage,
              fill: false,
              borderColor: 'rgb(8, 143, 143)',
              tension: 0.1,
            },
            {
              label: 'Output Voltage',
              data: outputVoltage,
              fill: false,
              borderColor: 'rgb(255, 83, 73)',
              tension: 0.1,
            },
            {
              label: 'Nominal Input Voltage',
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
                  value: parseInt(data?.input_voltage_nominal, 10),
                },
              },
            },
          },
        }}
      />
    </Card>
  )
}
