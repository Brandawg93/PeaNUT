import React from 'react'
import { render, RenderOptions, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SettingsProvider } from '@/client/context/settings'
import { LanguageContext } from '@/client/context/language'
import { TimeRangeProvider } from '@/client/context/time-range'
import { ThemeProvider } from '@/client/context/theme-provider'

// Mock getSettings to prevent async state updates only when this module is imported
jest.mock('@/app/actions', () => ({
  ...jest.requireActual('@/app/actions'),
  getSettings: jest.fn().mockResolvedValue(''),
  checkSettings: jest.fn(),
}))

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  language?: string
}

const createTestWrapper = (options: CustomRenderOptions = {}) => {
  const { queryClient, language = 'en' } = options

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient || new QueryClient()}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <SettingsProvider>
          <TimeRangeProvider>
            <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>
          </TimeRangeProvider>
        </SettingsProvider>
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
