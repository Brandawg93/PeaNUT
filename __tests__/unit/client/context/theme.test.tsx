import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ThemeProvider from '../../../../src/client/context/theme'

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
})
