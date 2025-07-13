import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VoltsChart from '@/client/components/line-charts/volts-chart'
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
    'input.voltage': {
      value: '1',
    },
    'device.serial': {
      value: 'test',
    },
    'input.voltage.nominal': {
      value: '1',
    },
    'output.voltage': {
      value: '1',
    },
  },
  rwVars: [],
  commands: [],
  description: 'test',
  clients: [],
  name: 'test',
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
    const vars = device.vars
    const chart = (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <SettingsProvider>
            <TimeRangeProvider>
              <LanguageContext.Provider value='en'>
                <VoltsChart
                  id={device.name}
                  inputVoltage={+vars['input.voltage'].value}
                  inputVoltageNominal={+vars['input.voltage.nominal']?.value}
                  outputVoltage={+vars['output.voltage']?.value}
                  updated={new Date()}
                />
              </LanguageContext.Provider>
            </TimeRangeProvider>
          </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
    const { getByTestId } = render(chart)
    expect(getByTestId('volts-chart')).toBeInTheDocument()
  })

  it('renders with no output voltage', () => {
    const vars = { ...device.vars }
    delete vars['output.voltage']
    const chart = (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <SettingsProvider>
            <TimeRangeProvider>
              <LanguageContext.Provider value='en'>
                <VoltsChart
                  id={device.name}
                  inputVoltage={+vars['input.voltage'].value}
                  inputVoltageNominal={+vars['input.voltage.nominal']?.value}
                  outputVoltage={+vars['output.voltage']?.value}
                  updated={new Date()}
                />
              </LanguageContext.Provider>
            </TimeRangeProvider>
          </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
    const { getByTestId } = render(chart)
    expect(getByTestId('volts-chart')).toBeInTheDocument()
  })
})
