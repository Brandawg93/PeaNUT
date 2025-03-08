import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DeviceWrapper from '@/client/components/device-wrapper'
import { LanguageContext } from '@/client/context/language'

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ name: '1.0.0' }]),
  })
) as jest.Mock

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

const mockDeviceData = {
  device: {
    name: 'test-ups',
    description: 'Test UPS',
    commands: ['test.command'],
    vars: {
      'ups.mfr': { value: 'Test Manufacturer' },
      'ups.model': { value: 'Test Model' },
      'device.serial': { value: '123456' },
      'ups.status': { value: 'OL' },
      'ups.load': { value: '50' },
      'ups.realpower.nominal': { value: '1000' },
      'battery.charge': { value: '75' },
      'battery.runtime': { value: '3600' },
    },
  },
  updated: new Date().toISOString(),
}

const mockGetDeviceAction = jest.fn()
const mockRunCommandAction = jest.fn()
const mockLogoutAction = jest.fn()

describe('DeviceWrapper', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    localStorage.clear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <LanguageContext.Provider value='en'>
          <DeviceWrapper
            device='test-ups'
            getDeviceAction={mockGetDeviceAction}
            runCommandAction={mockRunCommandAction}
            logoutAction={mockLogoutAction}
          />
        </LanguageContext.Provider>
      </QueryClientProvider>
    )
  }

  it('should show loading state initially', () => {
    mockGetDeviceAction.mockImplementation(() => new Promise(() => {}))
    renderComponent()
    expect(screen.getByTestId('loading-wrapper')).toBeInTheDocument()
  })

  it('should show empty state when no device data is available', async () => {
    mockGetDeviceAction.mockResolvedValue({ device: null })
    renderComponent()
    await waitFor(() => {
      expect(screen.getByTestId('empty-wrapper')).toBeInTheDocument()
    })
  })

  it('should display device information when data is available', async () => {
    mockGetDeviceAction.mockResolvedValue(mockDeviceData)
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Test Manufacturer')).toBeInTheDocument()
      expect(screen.getByText('Test Model')).toBeInTheDocument()
      expect(screen.getByText('123456')).toBeInTheDocument()
    })
  })

  it('should display correct status icon for OL status', async () => {
    mockGetDeviceAction.mockResolvedValue(mockDeviceData)
    renderComponent()
    await waitFor(() => {
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })
  })

  it('should display correct status icon for OB status', async () => {
    const obStatusData = {
      ...mockDeviceData,
      device: {
        ...mockDeviceData.device,
        vars: {
          ...mockDeviceData.device.vars,
          'ups.status': { value: 'OB' },
        },
      },
    }
    mockGetDeviceAction.mockResolvedValue(obStatusData)
    renderComponent()
    await waitFor(() => {
      expect(screen.getByTestId('triangle-icon')).toBeInTheDocument()
    })
  })

  it('should display correct status icon for LB status', async () => {
    const lbStatusData = {
      ...mockDeviceData,
      device: {
        ...mockDeviceData.device,
        vars: {
          ...mockDeviceData.device.vars,
          'ups.status': { value: 'LB' },
        },
      },
    }
    mockGetDeviceAction.mockResolvedValue(lbStatusData)
    renderComponent()
    await waitFor(() => {
      expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument()
    })
  })
})
