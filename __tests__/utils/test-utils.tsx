import React from 'react'
import { render, RenderOptions, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SettingsContext } from '@/client/context/settings'
import { LanguageContext } from '@/client/context/language'
import { TimeRangeProvider } from '@/client/context/time-range'
import { ThemeProvider } from '@/client/context/theme-provider'
import { DashboardSectionConfig, TemperatureUnit } from '@/server/settings'

// Mock getSettings to prevent async state updates only when this module is imported
jest.mock('@/app/actions', () => ({
  ...jest.requireActual('@/app/actions'),
  getSettings: jest.fn().mockResolvedValue(''),
  checkSettings: jest.fn(),
}))

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  language?: string
  settings?: any
}

const TestSettingsProvider = ({
  children,
  customSettings = {},
}: {
  children: React.ReactNode
  customSettings?: any
}) => {
  const value = {
    settings: {
      DATE_FORMAT: 'MM/DD/YYYY',
      TIME_FORMAT: '12-hour',
      TEMPERATURE_UNIT: 'celsius' as TemperatureUnit,
      DASHBOARD_SECTIONS: [
        { key: 'KPIS', enabled: true },
        { key: 'CHARTS', enabled: true },
        { key: 'VARIABLES', enabled: true },
      ] as DashboardSectionConfig,
      DISABLE_VERSION_CHECK: true,
      INFLUX_HOST: '',
      INFLUX_TOKEN: '',
      INFLUX_ORG: '',
      INFLUX_BUCKET: '',
      INFLUX_INTERVAL: 10,
      NUT_SERVERS: [],
      ...customSettings,
    },
    refreshSettings: () => {},
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

const createTestWrapper = (options: CustomRenderOptions = {}) => {
  const { queryClient, language = 'en', settings = {} } = options

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient || new QueryClient()}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <TestSettingsProvider customSettings={settings}>
          <TimeRangeProvider>
            <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>
          </TimeRangeProvider>
        </TestSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )

  TestWrapper.displayName = 'TestWrapper'
  return TestWrapper
}

export const renderWithProviders = (ui: React.ReactElement, options: CustomRenderOptions = {}) => {
  const Wrapper = createTestWrapper(options)

  const result = render(ui, { wrapper: Wrapper, ...options })

  // Wait for any pending state updates to complete
  return {
    ...result,
    rerender: async (ui: React.ReactElement) => {
      await act(async () => {
        result.rerender(ui)
      })
    },
  }
}

// Helper function to wait for settings to load
export const waitForSettings = async () => {
  await waitFor(
    () => {
      // Wait for any async operations to complete
    },
    { timeout: 1000 }
  )
}
