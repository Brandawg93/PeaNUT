import React from 'react'
import { render, screen } from '@testing-library/react'
import TimeTruncation from '@/client/components/time-truncation'
import { TimeRangeProvider } from '@/client/context/time-range'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

const renderWithProvider = (component: React.ReactElement) => {
  return render(<TimeRangeProvider>{component}</TimeRangeProvider>)
}

describe('TimeTruncation', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('0')
    localStorageMock.setItem.mockClear()
  })

  it('renders time truncation control', () => {
    const mockOnTimeRangeChange = jest.fn()
    renderWithProvider(<TimeTruncation timeRange={0} onTimeRangeChange={mockOnTimeRangeChange} disabled={false} />)

    expect(screen.getByTitle('sidebar.timeRange.title')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    const mockOnTimeRangeChange = jest.fn()
    renderWithProvider(<TimeTruncation timeRange={0} onTimeRangeChange={mockOnTimeRangeChange} disabled={true} />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('has correct button structure', () => {
    const mockOnTimeRangeChange = jest.fn()
    renderWithProvider(<TimeTruncation timeRange={0} onTimeRangeChange={mockOnTimeRangeChange} disabled={false} />)

    // Should have two buttons: one for the clock icon and one for the dropdown
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })
})
