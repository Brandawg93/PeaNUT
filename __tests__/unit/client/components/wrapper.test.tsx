import { render } from '@testing-library/react'
import Wrapper from '@/client/components/wrapper'

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    }
  },
}))

describe('Wrapper', () => {
  it('renders', () => {
    const lng = 'en'
    const { getByTestId } = render(<Wrapper lng={lng} />)

    expect(getByTestId('wrapper')).toBeInTheDocument()
  })
})
