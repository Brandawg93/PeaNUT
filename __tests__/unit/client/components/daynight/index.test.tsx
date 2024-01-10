import { render } from '@testing-library/react'
import DayNightSwitch from '@/client/components/daynight'

describe('Daynight', () => {
  it('renders', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynight')).toBeInTheDocument()
  })
})
