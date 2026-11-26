import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DeviceGrid, { MemoizedDeviceGrid } from '@/client/components/device-grid'
import { DevicesData, DEVICE } from '@/common/types'
import { LanguageContext } from '@/client/context/language'
import { threePhaseVars } from '../../../__mocks__/chartData'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const queryClient = new QueryClient()

const mockDevice: DEVICE = {
  id: 'localhost_3493_test-device',
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
  beforeAll(() => {
    // Opening Radix tooltips measures their content; jsdom has no ResizeObserver.
    globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }))
  })

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

  it.each([0, '0'])('displays a reported zero load (%p)', (value) => {
    render(<DeviceGrid data={{ ...mockDevicesData, devices: [{ ...mockDevice, vars: { 'ups.load': { value } } }] }} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('updates the memoized grid when phase load changes or an overall zero appears', () => {
    const data = { ...mockDevicesData, devices: [{ ...mockDevice, vars: threePhaseVars }] }
    const { rerender } = render(<MemoizedDeviceGrid data={data} />)
    expect(screen.getByText('11%')).toBeInTheDocument()

    const vars = { ...threePhaseVars, 'output.L1.power.percent': { value: 20 } }
    rerender(<MemoizedDeviceGrid data={{ ...data, devices: [{ ...mockDevice, vars }] }} />)
    expect(screen.getByText('20%')).toBeInTheDocument()

    rerender(
      <MemoizedDeviceGrid
        data={{ ...data, devices: [{ ...mockDevice, vars: { ...vars, 'ups.load': { value: 0 } } }] }}
      />
    )
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('updates the phase wattage tooltip even when the load is unchanged', async () => {
    const data = { ...mockDevicesData, devices: [{ ...mockDevice, vars: threePhaseVars }] }
    const { rerender } = render(<MemoizedDeviceGrid data={data} />)
    fireEvent.pointerMove(screen.getByText('11%'), { pointerType: 'mouse' })
    expect(await screen.findByRole('tooltip')).toHaveTextContent('16600W')

    const vars = { ...threePhaseVars, 'output.L1.realpower': { value: 5000 } }
    rerender(<MemoizedDeviceGrid data={{ ...data, devices: [{ ...mockDevice, vars }] }} />)
    fireEvent.pointerMove(screen.getByText('11%'), { pointerType: 'mouse' })
    expect(await screen.findByRole('tooltip')).toHaveTextContent('17000W')
  })

  it('displays zero watts in the load tooltip', async () => {
    render(
      <DeviceGrid
        data={{
          ...mockDevicesData,
          devices: [{ ...mockDevice, vars: { 'ups.load': { value: 0 }, 'ups.realpower': { value: 0 } } }],
        }}
      />
    )
    fireEvent.pointerMove(screen.getByText('0%'), { pointerType: 'mouse' })
    expect(await screen.findByRole('tooltip')).toHaveTextContent('0W')
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

    // Only valid devices or devices with status should be displayed
    expect(screen.getByText('test-device')).toBeInTheDocument()
    expect(screen.getByText('na-status-device')).toBeInTheDocument()
    // no-vars-device is still filtered because of Object.keys(device.vars).length > 0
    expect(screen.queryByText('no-vars-device')).not.toBeInTheDocument()
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

    // Device ID uses URL-safe underscore format: host_port_name
    expect(mockPush).toHaveBeenCalledWith('/device/localhost_3493_test-device')
  })

  it('encodes the device ID when navigating to device details', () => {
    const data: DevicesData = { ...mockDevicesData, devices: [{ ...mockDevice, id: 'My NAS #2~3493~ups' }] }
    render(
      <QueryClientProvider client={queryClient}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DeviceGrid data={data} />
        </LanguageContext.Provider>
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByText('details'))

    expect(mockPush).toHaveBeenCalledWith('/device/My%20NAS%20%232~3493~ups')
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
