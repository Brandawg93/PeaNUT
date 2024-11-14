import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import DayNightSwitch from '@/client/components/daynight/mobile'
import ThemeProvider from '@/client/context/theme'

describe('Daynightmobile', () => {
  let component: React.ReactElement
  beforeAll(() => {
    component = (
      <ThemeProvider>
        <DayNightSwitch />
      </ThemeProvider>
    )
  })

  it('renders', () => {
    const { getByTestId } = render(component)

    expect(getByTestId('daynightmobile')).toBeInTheDocument()
  })

  it('renders in light mode', () => {
    const { getByTestId } = render(component)

    expect(getByTestId('daynightmobile')).toBeInTheDocument()
    const select = getByTestId('select')
    fireEvent.change(select, { target: { value: 'light' } })
    expect(document.documentElement.classList).toContain('light')
  })

  it('renders in dark mode', () => {
    const { getByTestId } = render(component)

    expect(getByTestId('daynightmobile')).toBeInTheDocument()
    const select = getByTestId('select')
    fireEvent.change(select, { target: { value: 'dark' } })
    expect(document.documentElement.classList).toContain('dark')
  })

  it('renders in system mode', () => {
    const { getByTestId } = render(component)

    expect(getByTestId('daynightmobile')).toBeInTheDocument()
    const select = getByTestId('select')
    fireEvent.change(select, { target: { value: 'system' } })
    expect(document.documentElement.classList).toContain('light')
    expect(document.documentElement.classList).not.toContain('dark')
  })
})
