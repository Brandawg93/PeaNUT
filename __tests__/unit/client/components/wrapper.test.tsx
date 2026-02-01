import React from 'react'
import { render, screen } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import Wrapper from '@/client/components/wrapper'
import { LanguageContext } from '@/client/context/language'
import { TimeRangeProvider } from '@/client/context/time-range'
import { SettingsProvider } from '@/client/context/settings'
import { ThemeProvider } from '@/client/context/theme-provider'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ name: '1.0.0' }]),
  })
) as jest.Mock

// Mock window.matchMedia for next-themes
Object.defineProperty(globalThis.window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
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
        rwVars: [],
        clients: [],
        commands: [],
      },
    ],
    updated: '2023-10-01T00:00:00Z',
  }

  const renderComponent = (getDevicesAction = {}) =>
    render(
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <SettingsProvider>
          <TimeRangeProvider>
            <LanguageContext.Provider value='en'>
              <Wrapper getDevicesAction={jest.fn().mockResolvedValue(getDevicesAction)} logoutAction={jest.fn()} />
            </LanguageContext.Provider>
          </TimeRangeProvider>
        </SettingsProvider>
      </ThemeProvider>
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

    const { findByTestId } = renderComponent()
    const wrapper = await findByTestId('wrapper')
    expect(wrapper).toBeInTheDocument()
    // Check that skeleton components are present
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders error state', async () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { devices: [] },
      refetch: jest.fn(),
    })

    const { findByTestId } = renderComponent()
    const wrapper = await findByTestId('empty-wrapper')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders success state', async () => {
    const { findByTestId } = renderComponent()
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

    const { findByTestId } = renderComponent()
    const icon = await findByTestId('bolt-icon')
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

    const { findByTestId } = renderComponent()
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

    const { findByTestId } = renderComponent()
    const icon = await findByTestId('exclamation-icon')
    expect(icon).toBeInTheDocument()
  })
})
