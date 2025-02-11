import React from 'react'
import { useRouter } from 'next/navigation'
import { render } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import Wrapper from '@/client/components/wrapper'
import { LanguageContext } from '@/client/context/language'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ name: '1.0.0' }]),
  })
) as jest.Mock

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
        rwVars: [],
        clients: [],
        commands: [],
      },
    ],
    updated: '2023-10-01T00:00:00Z',
  }

  const renderComponent = (checkSettingsAction: boolean, getDevicesAction = {}) =>
    render(
      <LanguageContext.Provider value='en'>
        <Wrapper
          checkSettingsAction={jest.fn().mockResolvedValue(checkSettingsAction)}
          getDevicesAction={jest.fn().mockResolvedValue(getDevicesAction)}
          runCommandAction={jest.fn().mockResolvedValue({})}
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
    const mockRouter = {
      replace: jest.fn(),
    }
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    const { findByTestId } = renderComponent(false)
    const wrapper = await findByTestId('wrapper')
    expect(wrapper).toBeInTheDocument()
    expect(mockRouter.replace).toHaveBeenCalled()
  })

  it('renders success state', async () => {
    const { findByTestId } = renderComponent(true)
    const wrapper = await findByTestId('wrapper')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders status "OL CHRG"', async () => {
    const mockDevicesDataWithStatus = {
      ...mockDevicesData,
      devices: [
        {
          ...mockDevicesData.devices[0],
          vars: {
            ...mockDevicesData.devices[0].vars,
            'ups.status': { value: 'OL CHRG' },
          },
        },
      ],
    }

    ;(useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockDevicesDataWithStatus,
      refetch: jest.fn(),
    })

    const { findByTestId } = renderComponent(true)
    const icon = await findByTestId('check-icon')
    expect(icon).toBeInTheDocument()
  })

  it('renders status "OB"', async () => {
    const mockDevicesDataWithStatus = {
      ...mockDevicesData,
      devices: [
        {
          ...mockDevicesData.devices[0],
          vars: {
            ...mockDevicesData.devices[0].vars,
            'ups.status': { value: 'OB' },
          },
        },
      ],
    }

    ;(useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockDevicesDataWithStatus,
      refetch: jest.fn(),
    })

    const { findByTestId } = renderComponent(true)
    const icon = await findByTestId('triangle-icon')
    expect(icon).toBeInTheDocument()
  })

  it('renders status "LB"', async () => {
    const mockDevicesDataWithStatus = {
      ...mockDevicesData,
      devices: [
        {
          ...mockDevicesData.devices[0],
          vars: {
            ...mockDevicesData.devices[0].vars,
            'ups.status': { value: 'LB' },
          },
        },
      ],
    }

    ;(useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockDevicesDataWithStatus,
      refetch: jest.fn(),
    })

    const { findByTestId } = renderComponent(true)
    const icon = await findByTestId('exclamation-icon')
    expect(icon).toBeInTheDocument()
  })
})
