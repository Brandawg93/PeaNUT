import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ThemeProvider, { ThemeContext } from '../../../../src/client/context/theme'

describe('ThemeProvider', () => {
  it('should render children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid='child'>Hello World</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should set initial theme based on localStorage', () => {
    localStorage.setItem('theme', 'dark')
    render(
      <ThemeProvider>
        <div data-testid='child'>Hello World</div>
      </ThemeProvider>
    )
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should set initial theme based on system preference', () => {
    localStorage.removeItem('theme')
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }
    })
    render(
      <ThemeProvider>
        <div data-testid='child'>Hello World</div>
      </ThemeProvider>
    )
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should provide theme context', () => {
    render(
      <ThemeProvider>
        <ThemeContext.Consumer>{({ theme }) => <div data-testid='theme'>{theme}</div>}</ThemeContext.Consumer>
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('system')
  })
})
