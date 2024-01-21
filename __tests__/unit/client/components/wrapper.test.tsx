import { render } from '@testing-library/react'

import Wrapper from '@/client/components/wrapper'

describe('Wrapper', () => {
  it('renders', () => {
    const { getByTestId } = render(<Wrapper />)

    expect(getByTestId('wrapper')).toBeInTheDocument()
  })
})
