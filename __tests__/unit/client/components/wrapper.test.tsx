import { render } from '@testing-library/react'

import LanguageProvider from '@/client/context/language'
import Wrapper from '@/client/components/wrapper'

describe('Wrapper', () => {
  it('renders', () => {
    const { getByTestId } = render(<Wrapper />)

    expect(getByTestId('wrapper')).toBeInTheDocument()
  })
})
