import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VoltAmpsChart from '@/client/components/line-charts/volt-amps-chart'
import { DEVICE } from '@/common/types'
import { LanguageContext } from '@/client/context/language'
import { TimeRangeProvider } from '@/client/context/time-range'
import { SettingsProvider } from '@/client/context/settings'
import { ThemeProvider } from '@/client/context/theme-provider'

const device: DEVICE = {
  vars: {
    'ups.power': {
      value: '1',
    },
    'device.serial': {
      value: 'test',
    },
    'ups.power.nominal': {
      value: '1',
    },
  },
  rwVars: [],
  commands: [],
  description: 'test',
  clients: [],
  name: 'test',
}

// Helper function to create a test wrapper component
const createTestWrapper = (children: React.ReactNode, queryClient: QueryClient) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <SettingsProvider>
        <TimeRangeProvider>
          <LanguageContext.Provider value='en'>{children}</LanguageContext.Provider>
        </TimeRangeProvider>
      </SettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

// Helper function to render VoltAmpsChart with common props
const renderVoltAmpsChart = (queryClient: QueryClient, vars: DEVICE['vars']) => {
  const chart = (
    <VoltAmpsChart
      id={device.name}
      power={+vars['ups.power'].value}
      powerNominal={+vars['ups.power.nominal']?.value}
      updated={new Date()}
    />
  )

  return render(createTestWrapper(chart, queryClient))
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

  it('renders', () => {
    const { getByTestId } = renderVoltAmpsChart(queryClient, device.vars)
    expect(getByTestId('volt-amps-chart')).toBeInTheDocument()
  })
})
