import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VoltsChart from '@/client/components/line-charts/volts-chart'
import { DEVICE } from '@/common/types'
import { LanguageContext } from '@/client/context/language'
import { TimeRangeProvider } from '@/client/context/time-range'
import { SettingsProvider } from '@/client/context/settings'
import { ThemeProvider } from '@/client/context/theme-provider'
import { device } from '../../../../__mocks__/chartData'

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

// Helper function to render VoltsChart with common props
const renderVoltsChart = (queryClient: QueryClient, vars: DEVICE['vars'], outputVoltage?: number) => {
  const chart = (
    <VoltsChart
      id={device.name}
      inputVoltage={+vars['input.voltage'].value}
      inputVoltageNominal={+vars['input.voltage.nominal']?.value}
      outputVoltage={outputVoltage ?? +vars['output.voltage']?.value}
      updated={new Date()}
    />
  )

  return render(createTestWrapper(chart, queryClient))
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

  it('renders', () => {
    const { getByTestId } = renderVoltsChart(queryClient, device.vars)
    expect(getByTestId('volts-chart')).toBeInTheDocument()
  })

  it('renders with no output voltage', () => {
    const vars = { ...device.vars }
    delete vars['output.voltage']
    const { getByTestId } = renderVoltsChart(queryClient, vars, undefined)
    expect(getByTestId('volts-chart')).toBeInTheDocument()
  })
})
