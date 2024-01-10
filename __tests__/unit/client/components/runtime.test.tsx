import { render } from '@testing-library/react'
import Runtime from '@/client/components/runtime'

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

describe('Runtime', () => {
  it('renders', () => {
    const lng = 'en'
    const { getByTestId } = render(<Runtime runtime={0.1} lng={lng} />)

    expect(getByTestId('runtime')).toBeInTheDocument()
  })
})
