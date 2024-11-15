import React from 'react'
import { render, waitFor } from '@testing-library/react'
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

  const renderComponent = (checkSettingsAction: boolean, getDevicesAction = {}, disconnectAction = null) =>
    render(
      <LanguageContext.Provider value='en'>
        <Wrapper
          checkSettingsAction={jest.fn().mockResolvedValue(checkSettingsAction)}
          getDevicesAction={jest.fn().mockResolvedValue(getDevicesAction)}
          disconnectAction={jest.fn().mockResolvedValue(disconnectAction)}
        />
      </LanguageContext.Provider>
    )

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

    const { findByTestId } = renderComponent(true)
    const wrapper = await findByTestId('loading-wrapper')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders error state', async () => {
    const { queryByText } = renderComponent(false)
    await waitFor(() => {
      expect(queryByText('connect.test')).not.toBeInTheDocument()
    })
  })
})
