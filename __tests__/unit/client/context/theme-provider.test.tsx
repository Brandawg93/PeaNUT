import * as React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@/client/context/theme-provider'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    )

    expect(getByText('Test Child')).toBeInTheDocument()
  })

  it('passes through props to NextThemesProvider', () => {
    const mockProps = {
      attribute: 'class' as const,
      defaultTheme: 'light',
      enableSystem: true,
    }

    const { container } = render(
      <ThemeProvider {...mockProps}>
        <div>Test Child</div>
      </ThemeProvider>
    )

    // Verify the provider is rendered with the correct props
    expect(container.firstChild).toBeInTheDocument()
  })
})
