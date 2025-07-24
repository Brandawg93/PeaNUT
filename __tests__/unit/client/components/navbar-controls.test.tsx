import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NavBarControls from '@/client/components/navbar-controls'
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

describe('NavBar', () => {
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
    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <SettingsProvider>
            <TimeRangeProvider>
              <LanguageContext.Provider value='en'>
                <NavBarControls
                  onRefreshClick={() => {}}
                  onRefetch={() => {}}
                  onLogout={() => {}}
                  disableRefresh={false}
                />
              </LanguageContext.Provider>
            </TimeRangeProvider>
          </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )

    const langSwitcher = screen.getByTitle('sidebar.language')

    expect(langSwitcher).toBeInTheDocument()
  })
})
