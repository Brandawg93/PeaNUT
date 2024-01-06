import { render, screen } from '@testing-library/react'
import NavBar from '@/client/components/navbar'

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
        lng={''}
      />
    )

    const heading = screen.getByText('PeaNUT')

    expect(heading).toBeInTheDocument()
  })
})
