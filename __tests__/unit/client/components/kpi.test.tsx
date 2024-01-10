import { render } from '@testing-library/react'
import Kpi from '@/client/components/kpi'

describe('Kpi', () => {
  it('renders', () => {
    const { getByTestId } = render(<Kpi text={'PeaNUT'} description='PeaNUT' />)

    expect(getByTestId('kpi')).toBeInTheDocument()
  })
})
