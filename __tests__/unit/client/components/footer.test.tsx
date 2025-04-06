import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Footer from '@/client/components/footer'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        {
          name: 'v1.0.0',
          published_at: '2021-01-01T00:00:00Z',
          html_url: '',
        },
      ]),
  })
) as jest.Mock

describe('Footer', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('renders', () => {
    const { getByTestId } = render(<Footer updated={new Date()} />)
    expect(getByTestId('footer')).toBeInTheDocument()
  })

  it('toggles time format and updates localStorage', () => {
    const { getByText } = render(<Footer updated={new Date()} />)
    // Initially use24Hour should be false (default)
    expect(localStorage.getItem('use24Hour')).toBeNull()
    // Find and click the last updated button
    const lastUpdatedButton = getByText(/lastUpdated/i)
    fireEvent.click(lastUpdatedButton)
    // After toggle, use24Hour should be true
    expect(localStorage.getItem('use24Hour')).toBe('true')
    // Click again to toggle back
    fireEvent.click(lastUpdatedButton)
    // After second toggle, use24Hour should be false
    expect(localStorage.getItem('use24Hour')).toBe('false')
  })
})
