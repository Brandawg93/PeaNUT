import React from 'react'
import { render, screen } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import Wrapper from '@/client/components/wrapper'
import { LanguageContext } from '@/client/context/language'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      replace: () => null,
    }
  },
}))

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('../../../../src/client/components/footer', () => {
  const MockFooter = () => <div data-testid='mock-footer'>Mock Footer</div>
  MockFooter.displayName = 'MockFooter'
  return MockFooter
})

describe('Wrapper Component', () => {
  const mockDevicesData = {
    devices: [
      {
        name: 'Device1',
        description: 'Test Device 1',
        vars: {
          'ups.status': { value: 'OL' },
          'input.voltage': { value: '230' },
          'input.voltage.nominal': { value: '230' },
          'output.voltage': { value: '230' },
          'ups.realpower': { value: '100' },
          'ups.realpower.nominal': { value: '150' },
          'ups.load': { value: '50' },
          'battery.charge': { value: '80' },
          'battery.runtime': { value: '1200' },
          'ups.mfr': { value: 'Manufacturer' },
          'ups.model': { value: 'Model' },
          'device.serial': { value: '123456' },
        },
      },
    ],
    updated: '2023-10-01T00:00:00Z',
  }

  beforeEach(() => {
    ;(useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockDevicesData,
      refetch: jest.fn(),
    })
  })

  it('renders loading state', async () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      isLoading: true,
      data: null,
      refetch: jest.fn(),
    })

    render(
      <LanguageContext.Provider value='en'>
        <Wrapper
          checkSettingsAction={jest.fn().mockResolvedValue(true)}
          getDevicesAction={jest.fn().mockResolvedValue({})}
          disconnectAction={jest.fn().mockResolvedValue(null)}
        />
      </LanguageContext.Provider>
    )

    const wrapper = await screen.findByTestId('wrapper')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders error state', async () => {
    render(
      <LanguageContext.Provider value='en'>
        <Wrapper
          checkSettingsAction={jest.fn().mockResolvedValue(false)}
          getDevicesAction={jest.fn().mockResolvedValue({})}
          disconnectAction={jest.fn().mockResolvedValue(null)}
        />
      </LanguageContext.Provider>
    )
  })
})
