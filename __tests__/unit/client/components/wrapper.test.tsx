import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import Wrapper from '@/client/components/wrapper'
import { LanguageContext } from '@/client/context/language'
import { checkSettings } from '@/app/actions'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('../../../../src/app/actions', () => ({
  getDevices: jest.fn(),
  checkSettings: jest.fn(),
  disconnect: jest.fn(),
}))

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
    ;(checkSettings as jest.Mock).mockResolvedValue(true)
  })

  it('renders loading state', async () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      isLoading: true,
      data: null,
      refetch: jest.fn(),
    })

    render(
      <LanguageContext.Provider value='en'>
        <Wrapper />
      </LanguageContext.Provider>
    )

    const wrapper = await screen.findByTestId('wrapper')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders error state', async () => {
    ;(checkSettings as jest.Mock).mockResolvedValue(false)

    render(
      <LanguageContext.Provider value='en'>
        <Wrapper />
      </LanguageContext.Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('connect.server')).toBeInTheDocument()
    })
  })
})
