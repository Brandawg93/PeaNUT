import React from 'react'
import { QueryClient } from '@tanstack/react-query'
import WattsChart from '@/client/components/line-charts/watts-chart'
import { DEVICE } from '@/common/types'
import { renderWithProviders, waitForSettings } from '../../../../utils/test-utils'
import { device } from '../../../../__mocks__/chartData'

// Helper function to render WattsChart with common props
const renderWattsChart = async (queryClient: QueryClient, vars: DEVICE['vars']) => {
  const chart = (
    <WattsChart
      id={device.name}
      realpower={+vars['ups.realpower'].value}
      realpowerNominal={+vars['ups.realpower.nominal']?.value}
      updated={new Date()}
    />
  )

  const result = renderWithProviders(chart, { queryClient })
  await waitForSettings()
  return result
}

describe('Watts', () => {
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
    const { getByTestId } = await renderWattsChart(queryClient, device.vars)
    expect(getByTestId('watts-chart')).toBeInTheDocument()
  })
})
