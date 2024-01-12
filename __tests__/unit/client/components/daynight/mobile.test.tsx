import { render } from '@testing-library/react'
import DayNightSwitch from '@/client/components/daynight/mobile'

describe('Daynightmobile', () => {
  it('renders', () => {
    const { getByTestId } = render(<DayNightSwitch />)

    expect(getByTestId('daynightmobile')).toBeInTheDocument()
  })
})
