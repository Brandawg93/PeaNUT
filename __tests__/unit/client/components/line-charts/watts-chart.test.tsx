import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import WattsChart from '@/client/components/line-charts/watts-chart'
import { DEVICE } from '@/common/types'
import { LanguageContext } from '@/client/context/language'
import { TimeRangeProvider } from '@/client/context/time-range'
import { SettingsProvider } from '@/client/context/settings'
import { ThemeProvider } from '@/client/context/theme-provider'

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

const device: DEVICE = {
  vars: {
    'ups.realpower': {
      value: '1',
    },
    'device.serial': {
      value: 'test',
    },
    'ups.realpower.nominal': {
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

// Helper function to render WattsChart with common props
const renderWattsChart = (queryClient: QueryClient, vars: DEVICE['vars']) => {
  const chart = (
    <WattsChart
      id={device.name}
      realpower={+vars['ups.realpower'].value}
      realpowerNominal={+vars['ups.realpower.nominal']?.value}
      updated={new Date()}
    />
  )

  return render(createTestWrapper(chart, queryClient))
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

  it('renders', () => {
    const { getByTestId } = renderWattsChart(queryClient, device.vars)
    expect(getByTestId('watts-chart')).toBeInTheDocument()
  })
})
