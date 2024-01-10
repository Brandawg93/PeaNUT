import { render, screen } from '@testing-library/react'
import NavBar from '@/client/components/navbar'

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

const devices = [
  {
    'device.serial': '1234',
    'device.mfr': 'test',
    'device.model': 'test',
  },
]

describe('NavBar', () => {
  it('renders', () => {
    const lng = 'en'
    render(
      <NavBar
        devices={devices}
        onRefreshClick={() => {}}
        onRefetch={() => {}}
        onDeviceChange={() => {}}
        disableRefresh={false}
        lng={lng}
      />
    )

    const heading = screen.getByText('PeaNUT')

    expect(heading).toBeInTheDocument()
  })
})
