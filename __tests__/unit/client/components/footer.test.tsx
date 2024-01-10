import { render } from '@testing-library/react'
import Footer from '@/client/components/footer'
import { DEVICE } from '@/common/types'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        {
          name: 'v1.0.0',
          published_at: '2021-01-01T00:00:00Z',
          html_url: '',
        },
      ]),
  })
) as jest.Mock

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

describe('Footer', () => {
  it('renders', () => {
    const lng = 'en'
    const { getByTestId } = render(<Footer lng={lng} updated={new Date()} />)

    expect(getByTestId('footer')).toBeInTheDocument()
  })
})
