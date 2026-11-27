import React from 'react'
import { screen } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import NavBarControls from '@/client/components/navbar-controls'
import { renderWithProviders, waitForSettings } from '../../../utils/test-utils'

// Mock window.matchMedia for next-themes
Object.defineProperty(globalThis, 'matchMedia', {
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

  it('renders', async () => {
    renderWithProviders(
      <NavBarControls onRefreshClick={() => {}} onRefetch={() => {}} onLogout={() => {}} disableRefresh={false} />,
      { queryClient }
    )
    await waitForSettings()

    const langSwitcher = screen.getByTitle('sidebar.language')

    expect(langSwitcher).toBeInTheDocument()
  })
})
