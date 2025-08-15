import React from 'react'
import { QueryClient } from '@tanstack/react-query'
import VoltsChart from '@/client/components/line-charts/volts-chart'
import { DEVICE } from '@/common/types'
import { renderWithProviders, waitForSettings } from '../../../../utils/test-utils'
import { device } from '../../../../__mocks__/chartData'

// Helper function to render VoltsChart with common props
const renderVoltsChart = async (queryClient: QueryClient, vars: DEVICE['vars'], outputVoltage?: number) => {
  const chart = (
    <VoltsChart
      id={device.name}
      inputVoltage={+vars['input.voltage'].value}
      inputVoltageNominal={+vars['input.voltage.nominal']?.value}
      outputVoltage={outputVoltage ?? +vars['output.voltage']?.value}
      updated={new Date()}
    />
  )

  const result = renderWithProviders(chart, { queryClient })
  await waitForSettings()
  return result
}

describe('Volts', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  it('renders', async () => {
    const { getByTestId } = await renderVoltsChart(queryClient, device.vars)
    expect(getByTestId('volts-chart')).toBeInTheDocument()
  })

  it('renders with no output voltage', async () => {
    const vars = { ...device.vars }
    delete vars['output.voltage']
    const { getByTestId } = await renderVoltsChart(queryClient, vars)
    expect(getByTestId('volts-chart')).toBeInTheDocument()
  })
})
