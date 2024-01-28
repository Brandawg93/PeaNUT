import { fireEvent, render } from '@testing-library/react'
import DayNightSwitch from '@/client/components/daynight'

describe('Daynight', () => {
  it('renders', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynight')).toBeInTheDocument()
  })

  it('renders in light mode', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynight')).toBeInTheDocument()
    const button = getByTestId('light')
    fireEvent.click(button)
    expect(document.documentElement.classList).toContain('light')
  })

  it('renders in dark mode', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynight')).toBeInTheDocument()
    const button = getByTestId('dark')
    fireEvent.click(button)
    expect(document.documentElement.classList).toContain('dark')
  })

  it('renders in system mode', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynight')).toBeInTheDocument()
    const button = getByTestId('system')
    fireEvent.click(button)
    expect(document.documentElement.classList).not.toContain('light')
    expect(document.documentElement.classList).not.toContain('dark')
  })
})
