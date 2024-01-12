import { render } from '@testing-library/react'
import Gauge from '@/client/components/gauge'

jest.mock('react-chartjs-2', () => ({
  Doughnut: () => null,
}))

describe('Gauge', () => {
  it('renders', () => {
    const { getByTestId } = render(<Gauge percentage={100} title='test' />)

    expect(getByTestId('gauge')).toBeInTheDocument()
  })
})
