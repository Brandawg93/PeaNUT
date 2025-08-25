import React from 'react'
import { render, screen } from '@testing-library/react'
import Runtime from '@/client/components/runtime'

// Mock the Kpi component
jest.mock('@/client/components/kpi', () => {
  return function MockKpi({ text, description }: { text: string; description: string }) {
    return (
      <div data-testid='kpi'>
        <span data-testid='kpi-text'>{text}</span>
        <span data-testid='kpi-description'>{description}</span>
      </div>
    )
  }
})

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock the LanguageContext
jest.mock('@/client/context/language', () => ({
  LanguageContext: React.createContext('en'),
}))

describe('Runtime Component', () => {
  it('renders with basic runtime', () => {
    render(<Runtime runtime={3600} />)
    expect(screen.getByTestId('runtime')).toBeInTheDocument()
  })

  it('displays runtime when provided', () => {
    render(<Runtime runtime={3600} />)
    expect(screen.getByTestId('kpi-text')).toHaveTextContent('1 hour')
  })

  it('displays N/A when runtime is 0 or negative', () => {
    render(<Runtime runtime={0} />)
    expect(screen.getByTestId('kpi-text')).toHaveTextContent('N/A')
  })

  it('calculates runtime from battery capacity when runtime is not available', () => {
    render(
      <Runtime
        runtime={0}
        batteryCapacity={9} // 9 Ah
        batteryVoltage={13.1} // 13.1V
        batteryCharge={100} // 100%
        upsLoad={26} // 26%
        upsRealpowerNominal={420} // 420W
      />
    )

    // Expected calculation:
    // Battery capacity in Wh = 9 Ah * 13.1V * 100% = 117.9 Wh
    // Current power = 26% * 420W = 109.2W
    // Runtime = 117.9 Wh / 109.2W = 1.08 hours = 3886 seconds = 1 hour, 4 minutes, 46 seconds
    expect(screen.getByTestId('kpi-text')).toHaveTextContent('1 hour, 4 minutes, 46 seconds')
  })

  it('calculates runtime from charge percentage when capacity is not available', () => {
    render(
      <Runtime
        runtime={0}
        batteryCharge={80} // 80%
        upsLoad={50} // 50%
        upsRealpowerNominal={1000} // 1000W
      />
    )

    // Expected calculation:
    // Full load runtime = 3600 seconds (1 hour)
    // Load factor = 50% = 0.5
    // Charge factor = 80% = 0.8
    // Runtime = 3600 * 0.8 / 0.5 = 5760 seconds = 1.6 hours
    expect(screen.getByTestId('kpi-text')).toHaveTextContent('1 hour, 36 minutes')
  })

  it('displays N/A when no calculation method is available', () => {
    render(<Runtime runtime={0} />)
    expect(screen.getByTestId('kpi-text')).toHaveTextContent('N/A')
  })

  it('prioritizes provided runtime over calculated runtime', () => {
    render(
      <Runtime
        runtime={1800} // 30 minutes
        batteryCapacity={9}
        batteryVoltage={13.1}
        batteryCharge={100}
        upsLoad={26}
        upsRealpowerNominal={420}
      />
    )

    // Should use the provided runtime (30 minutes) instead of calculating
    expect(screen.getByTestId('kpi-text')).toHaveTextContent('30 minutes')
  })

  it('formats time correctly for various durations', () => {
    const testCases = [
      { seconds: 3661, expected: '1 hour, 1 minute, 1 second' },
      { seconds: 86400, expected: '1 day' },
      { seconds: 90000, expected: '1 day, 1 hour' },
      { seconds: 45, expected: '45 seconds' },
      { seconds: 120, expected: '2 minutes' },
    ]

    testCases.forEach(({ seconds, expected }) => {
      const { unmount } = render(<Runtime runtime={seconds} />)
      expect(screen.getByTestId('kpi-text')).toHaveTextContent(expected)
      unmount()
    })
  })

  it('handles missing battery capacity gracefully', () => {
    render(<Runtime runtime={0} batteryVoltage={13.1} batteryCharge={100} upsLoad={26} upsRealpowerNominal={420} />)

    // Should fall back to charge-based calculation
    expect(screen.getByTestId('kpi-text')).toHaveTextContent('3 hours, 50 minutes')
  })

  it('handles missing voltage gracefully', () => {
    render(<Runtime runtime={0} batteryCapacity={9} batteryCharge={100} upsLoad={26} upsRealpowerNominal={420} />)

    // Should fall back to charge-based calculation
    expect(screen.getByTestId('kpi-text')).toHaveTextContent('3 hours, 50 minutes')
  })
})
