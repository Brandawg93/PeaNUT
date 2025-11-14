import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
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
      <div data-testid='temperature-unit'>{settings.TEMPERATURE_UNIT}</div>
      <button onClick={refreshSettings}>Refresh</button>
    </div>
  )
}

describe('Settings Context', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides initial empty settings', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    // Wait for the initial settings to load (which will be empty due to mock)
    await waitFor(() => {
      expect(screen.getByTestId('date-format')).toHaveTextContent('')
      expect(screen.getByTestId('time-format')).toHaveTextContent('')
      expect(screen.getByTestId('temperature-unit')).toHaveTextContent('celsius')
    })
  })

  it('fetches and provides settings on mount', async () => {
    const mockDateFormat = 'DD/MM/YYYY'
    const mockTimeFormat = '24-hour'

    jest.mocked(getSettings).mockImplementation((key: keyof SettingsType) => {
      if (key === 'DATE_FORMAT') return Promise.resolve(mockDateFormat)
      if (key === 'TIME_FORMAT') return Promise.resolve(mockTimeFormat)
      if (key === 'TEMPERATURE_UNIT') return Promise.resolve('fahrenheit')
      return Promise.resolve('')
    })

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByTestId('date-format')).toHaveTextContent(mockDateFormat)
      expect(screen.getByTestId('time-format')).toHaveTextContent(mockTimeFormat)
      expect(screen.getByTestId('temperature-unit')).toHaveTextContent('fahrenheit')
    })
  })

  it('refreshes settings when refreshSettings is called', async () => {
    const initialDateFormat = 'MM/DD/YYYY'
    const initialTimeFormat = '12-hour'
    const newDateFormat = 'YYYY-MM-DD'
    const newTimeFormat = '24-hour'

    // First call returns initial values
    jest.mocked(getSettings).mockImplementation((key: keyof SettingsType) => {
      if (key === 'DATE_FORMAT') return Promise.resolve(initialDateFormat)
      if (key === 'TIME_FORMAT') return Promise.resolve(initialTimeFormat)
      if (key === 'TEMPERATURE_UNIT') return Promise.resolve('celsius')
      return Promise.resolve('')
    })

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    // Wait for initial settings to load
    await waitFor(() => {
      expect(screen.getByTestId('date-format')).toHaveTextContent(initialDateFormat)
      expect(screen.getByTestId('time-format')).toHaveTextContent(initialTimeFormat)
    })

    // Update mock to return new values
    jest.mocked(getSettings).mockImplementation((key: keyof SettingsType) => {
      if (key === 'DATE_FORMAT') return Promise.resolve(newDateFormat)
      if (key === 'TIME_FORMAT') return Promise.resolve(newTimeFormat)
      if (key === 'TEMPERATURE_UNIT') return Promise.resolve('fahrenheit')
      return Promise.resolve('')
    })

    // Click refresh button and wait for the async operation to complete
    await act(async () => {
      screen.getByText('Refresh').click()
    })

    // Wait for new settings to load
    await waitFor(() => {
      expect(screen.getByTestId('date-format')).toHaveTextContent(newDateFormat)
      expect(screen.getByTestId('time-format')).toHaveTextContent(newTimeFormat)
      expect(screen.getByTestId('temperature-unit')).toHaveTextContent('fahrenheit')
    })
  })
})
