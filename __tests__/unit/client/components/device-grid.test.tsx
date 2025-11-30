import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DeviceGrid from '@/client/components/device-grid'
import { DevicesData, DEVICE } from '@/common/types'
import { LanguageContext } from '@/client/context/language'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const queryClient = new QueryClient()

const mockDevice: DEVICE = {
  id: 'localhost:3493/test-device',
  name: 'test-device',
  server: 'localhost:3493',
  description: 'Test Device Description',
  vars: {
    'ups.status': {
      value: 'OL',
    },
    'battery.charge': {
      value: '85',
    },
    'ups.load': {
      value: '45',
    },
    'device.serial': {
      value: 'test-serial',
    },
  },
  rwVars: ['ups.status'],
  commands: ['test.command'],
  clients: ['test-client'],
}

const mockDevicesData: DevicesData = {
  devices: [mockDevice],
  updated: new Date(),
  failedServers: [],
}

const mockLanguageContext = 'en'

describe('DeviceGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders device grid with data', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DeviceGrid data={mockDevicesData} />
        </LanguageContext.Provider>
      </QueryClientProvider>
    )

    // Check that the table is rendered
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Check that device name is displayed
    expect(screen.getByText('test-device')).toBeInTheDocument()

    // Check that device description is displayed
    expect(screen.getByText('Test Device Description')).toBeInTheDocument()

    // Check that status is displayed
    expect(screen.getByText('Online')).toBeInTheDocument()

    // Check that battery charge is displayed
    expect(screen.getByText('85%')).toBeInTheDocument()

    // Check that ups load is displayed
    expect(screen.getByText('45%')).toBeInTheDocument()

    // Check that details button is present
    expect(screen.getByText('details')).toBeInTheDocument()
  })

  it('renders empty state when no devices', () => {
    const emptyData: DevicesData = {
      devices: [],
      updated: new Date(),
      failedServers: [],
    }

    render(
      <QueryClientProvider client={queryClient}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DeviceGrid data={emptyData} />
        </LanguageContext.Provider>
      </QueryClientProvider>
    )

    // Table should still be rendered but with no rows
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('filters out devices with no vars or N/A status', () => {
    const deviceWithNoVars: DEVICE = {
      ...mockDevice,
      name: 'no-vars-device',
      vars: {},
    }

    const deviceWithNAStatus: DEVICE = {
      ...mockDevice,
      name: 'na-status-device',
      vars: {
        'ups.status': {
          value: 'N/A',
        },
      },
    }

    const dataWithFilteredDevices: DevicesData = {
      devices: [mockDevice, deviceWithNoVars, deviceWithNAStatus],
      updated: new Date(),
      failedServers: [],
    }

    render(
      <QueryClientProvider client={queryClient}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DeviceGrid data={dataWithFilteredDevices} />
        </LanguageContext.Provider>
      </QueryClientProvider>
    )

    // Only the valid device should be displayed
    expect(screen.getByText('test-device')).toBeInTheDocument()
    expect(screen.queryByText('no-vars-device')).not.toBeInTheDocument()
    expect(screen.queryByText('na-status-device')).not.toBeInTheDocument()
  })

  it('displays correct status icons for different status values', () => {
    const deviceWithChargingStatus: DEVICE = {
      ...mockDevice,
      name: 'charging-device',
      vars: {
        ...mockDevice.vars,
        'ups.status': {
          value: 'OL CHRG',
        },
      },
    }

    const deviceWithBatteryStatus: DEVICE = {
      ...mockDevice,
      name: 'battery-device',
      vars: {
        ...mockDevice.vars,
        'ups.status': {
          value: 'OB',
        },
      },
    }

    const deviceWithLowBatteryStatus: DEVICE = {
      ...mockDevice,
      name: 'low-battery-device',
      vars: {
        ...mockDevice.vars,
        'ups.status': {
          value: 'LB',
        },
      },
    }

    const dataWithDifferentStatuses: DevicesData = {
      devices: [deviceWithChargingStatus, deviceWithBatteryStatus, deviceWithLowBatteryStatus],
      updated: new Date(),
      failedServers: [],
    }

    render(
      <QueryClientProvider client={queryClient}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DeviceGrid data={dataWithDifferentStatuses} />
        </LanguageContext.Provider>
      </QueryClientProvider>
    )

    // Check for status icons
    expect(screen.getByTestId('bolt-icon')).toBeInTheDocument() // OL CHRG
    expect(screen.getByTestId('triangle-icon')).toBeInTheDocument() // OB
    expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument() // LB
  })

  it('handles missing battery charge and ups load values', () => {
    const deviceWithMissingValues: DEVICE = {
      ...mockDevice,
      name: 'missing-values-device',
      vars: {
        'ups.status': {
          value: 'OL',
        },
        // Missing battery.charge and ups.load
      },
    }

    const dataWithMissingValues: DevicesData = {
      devices: [deviceWithMissingValues],
      updated: new Date(),
      failedServers: [],
    }

    render(
      <QueryClientProvider client={queryClient}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DeviceGrid data={dataWithMissingValues} />
        </LanguageContext.Provider>
      </QueryClientProvider>
    )

    // Should display N/A for missing values
    expect(screen.getAllByText('N/A')).toHaveLength(2)
  })

  it('navigates to device details when details button is clicked', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DeviceGrid data={mockDevicesData} />
        </LanguageContext.Provider>
      </QueryClientProvider>
    )

    const detailsButton = screen.getByText('details')
    fireEvent.click(detailsButton)

    expect(mockPush).toHaveBeenCalledWith(`/device/${encodeURIComponent('localhost:3493/test-device')}`)
  })

  it('displays progress bars for battery charge and ups load', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DeviceGrid data={mockDevicesData} />
        </LanguageContext.Provider>
      </QueryClientProvider>
    )

    // Check that progress elements are rendered
    const progressElements = screen.getAllByRole('progressbar')
    expect(progressElements).toHaveLength(2)
  })
})
