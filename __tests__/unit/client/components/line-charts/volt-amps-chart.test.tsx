import React from 'react'
import { QueryClient } from '@tanstack/react-query'
import VoltAmpsChart from '@/client/components/line-charts/volt-amps-chart'
import { DEVICE } from '@/common/types'
import { renderWithProviders, waitForSettings } from '../../../../utils/test-utils'
import { device } from '../../../../__mocks__/chartData'

// Helper function to render VoltAmpsChart with common props
const renderVoltAmpsChart = async (queryClient: QueryClient, vars: DEVICE['vars']) => {
  const chart = (
    <VoltAmpsChart
      id={device.name}
      power={+vars['ups.power'].value}
      powerNominal={+vars['ups.power.nominal']?.value}
      updated={new Date()}
    />
  )

  const result = renderWithProviders(chart, { queryClient })
  await waitForSettings()
  return result
}

describe('VoltAmps', () => {
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
    const { getByTestId } = await renderVoltAmpsChart(queryClient, device.vars)
    expect(getByTestId('volt-amps-chart')).toBeInTheDocument()
  })
})
