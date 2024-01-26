import { fireEvent, render } from '@testing-library/react'
import DayNightSwitch from '@/client/components/daynight/mobile'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('Daynightmobile', () => {
  it('renders', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynightmobile')).toBeInTheDocument()
  })

  it('renders in light mode', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynightmobile')).toBeInTheDocument()
    const select = getByTestId('select')
    fireEvent.change(select, { target: { value: 'light' } })
    expect(document.documentElement.classList).toContain('light')
  })

  it('renders in dark mode', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynightmobile')).toBeInTheDocument()
    const select = getByTestId('select')
    fireEvent.change(select, { target: { value: 'dark' } })
    expect(document.documentElement.classList).toContain('dark')
  })

  it('renders in system mode', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynightmobile')).toBeInTheDocument()
    const select = getByTestId('select')
    fireEvent.change(select, { target: { value: 'system' } })
    expect(document.documentElement.classList).not.toContain('light')
    expect(document.documentElement.classList).not.toContain('dark')
  })
})
