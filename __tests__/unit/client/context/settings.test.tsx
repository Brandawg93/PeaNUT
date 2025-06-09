import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { SettingsProvider, useSettings } from '@/client/context/settings'
import { getSettings } from '@/app/actions'
import { SettingsType } from '@/server/settings'

// Mock the getSettings function
jest.mock('../../../../src/app/actions', () => ({
  checkSettings: jest.fn(),
  getSettings: jest.fn(),
}))

// Test component that uses the settings context
const TestComponent = () => {
  const { settings, refreshSettings } = useSettings()
  return (
    <div>
      <div data-testid='date-format'>{settings.DATE_FORMAT}</div>
      <div data-testid='time-format'>{settings.TIME_FORMAT}</div>
      <button onClick={refreshSettings}>Refresh</button>
    </div>
  )
}

describe('Settings Context', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides initial empty settings', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    expect(screen.getByTestId('date-format')).toHaveTextContent('')
    expect(screen.getByTestId('time-format')).toHaveTextContent('')
  })

  it('fetches and provides settings on mount', async () => {
    const mockDateFormat = 'DD/MM/YYYY'
    const mockTimeFormat = '24-hour'

    jest.mocked(getSettings).mockImplementation(async (key: keyof SettingsType) => {
      if (key === 'DATE_FORMAT') return mockDateFormat
      if (key === 'TIME_FORMAT') return mockTimeFormat
      return ''
    })

    await act(async () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      )
    })

    expect(screen.getByTestId('date-format')).toHaveTextContent(mockDateFormat)
    expect(screen.getByTestId('time-format')).toHaveTextContent(mockTimeFormat)
  })

  it('refreshes settings when refreshSettings is called', async () => {
    const initialDateFormat = 'MM/DD/YYYY'
    const initialTimeFormat = '12-hour'
    const newDateFormat = 'YYYY-MM-DD'
    const newTimeFormat = '24-hour'

    // First call returns initial values
    jest.mocked(getSettings).mockImplementation(async (key: keyof SettingsType) => {
      if (key === 'DATE_FORMAT') return initialDateFormat
      if (key === 'TIME_FORMAT') return initialTimeFormat
      return ''
    })

    await act(async () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      )
    })

    expect(screen.getByTestId('date-format')).toHaveTextContent(initialDateFormat)
    expect(screen.getByTestId('time-format')).toHaveTextContent(initialTimeFormat)

    // Update mock to return new values
    jest.mocked(getSettings).mockImplementation(async (key: keyof SettingsType) => {
      if (key === 'DATE_FORMAT') return newDateFormat
      if (key === 'TIME_FORMAT') return newTimeFormat
      return ''
    })

    // Click refresh button
    await act(async () => {
      screen.getByText('Refresh').click()
    })

    expect(screen.getByTestId('date-format')).toHaveTextContent(newDateFormat)
    expect(screen.getByTestId('time-format')).toHaveTextContent(newTimeFormat)
  })
})
