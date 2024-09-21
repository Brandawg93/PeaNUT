import React from 'react'
import { render, screen } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import Page from '@/app/page'
import { checkSettings } from '@/app/actions'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('react-chartjs-2', () => ({
  Line: () => null,
  Doughnut: () => null,
}))

jest.mock('../../../src/app/actions', () => ({
  getDevices: jest.fn(),
  checkSettings: jest.fn(),
  disconnect: jest.fn(),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ name: '1.0.0' }]),
  })
) as jest.Mock

describe('Page', () => {
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

  it('renders a heading', async () => {
    render(<Page />)

    const wrapper = await screen.findByTestId('wrapper')
    expect(wrapper).toBeInTheDocument()
  })
})
