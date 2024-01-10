import { render } from '@testing-library/react'
import Runtime from '@/client/components/runtime'

describe('Runtime', () => {
  it('renders', () => {
    const { getByTestId } = render(<Runtime runtime={0.1} />)

    expect(getByTestId('runtime')).toBeInTheDocument()
  })
})
