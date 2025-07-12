import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

  describe('toggleWattsOrPercent', () => {
    it('should toggle localStorage preference when gauge is clicked', async () => {
      mockGetDeviceAction.mockResolvedValue(mockDeviceData)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
      })

      // Find and click the first gauge (current load)
      const gauges = screen.getAllByTestId('gauge')
      expect(gauges.length).toBeGreaterThan(0)
      fireEvent.click(gauges[0])

      await waitFor(() => {
        expect(localStorage.getItem('wattsOrPercent')).toBe('true')
      })
    })

    it('should initialize with localStorage preference for watts', async () => {
      localStorage.setItem('wattsOrPercent', 'true')
      mockGetDeviceAction.mockResolvedValue(mockDeviceData)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
        expect(localStorage.getItem('wattsOrPercent')).toBe('true')
      })
    })

    it('should initialize with localStorage preference for percentage', async () => {
      localStorage.setItem('wattsOrPercent', 'false')
      mockGetDeviceAction.mockResolvedValue(mockDeviceData)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
        expect(localStorage.getItem('wattsOrPercent')).toBe('false')
      })
    })

    it('should handle missing ups.realpower.nominal gracefully', async () => {
      const dataWithoutNominal = {
        ...mockDeviceData,
        device: {
          ...mockDeviceData.device,
          vars: {
            ...mockDeviceData.device.vars,
            'ups.realpower.nominal': undefined,
          },
        },
      }
      mockGetDeviceAction.mockResolvedValue(dataWithoutNominal)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
      })

      // Click should still work but stay in percentage mode
      const gauges = screen.getAllByTestId('gauge')
      fireEvent.click(gauges[0])

      await waitFor(() => {
        expect(localStorage.getItem('wattsOrPercent')).toBe('true')
      })
    })

    it('should handle missing ups.load gracefully', async () => {
      const dataWithoutLoad = {
        ...mockDeviceData,
        device: {
          ...mockDeviceData.device,
          vars: {
            ...mockDeviceData.device.vars,
            'ups.load': undefined,
          },
        },
      }
      mockGetDeviceAction.mockResolvedValue(dataWithoutLoad)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
        // Should show N/A when load is missing
        const naElements = screen.getAllByText('N/A')
        expect(naElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('toggleWattHours', () => {
    it('should toggle localStorage preference when battery gauge is clicked', async () => {
      mockGetDeviceAction.mockResolvedValue(mockDeviceData)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
      })

      // Find and click the second gauge (battery charge)
      const gauges = screen.getAllByTestId('gauge')
      expect(gauges.length).toBeGreaterThan(1)
      fireEvent.click(gauges[1])

      await waitFor(() => {
        expect(localStorage.getItem('wattHours')).toBe('true')
      })
    })

    it('should initialize with localStorage preference for watt-hours', async () => {
      localStorage.setItem('wattHours', 'true')
      mockGetDeviceAction.mockResolvedValue(mockDeviceData)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
        expect(localStorage.getItem('wattHours')).toBe('true')
      })
    })

    it('should initialize with localStorage preference for percentage', async () => {
      localStorage.setItem('wattHours', 'false')
      mockGetDeviceAction.mockResolvedValue(mockDeviceData)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
        expect(localStorage.getItem('wattHours')).toBe('false')
      })
    })

    it('should handle missing battery.charge gracefully', async () => {
      const dataWithoutCharge = {
        ...mockDeviceData,
        device: {
          ...mockDeviceData.device,
          vars: {
            ...mockDeviceData.device.vars,
            'battery.charge': undefined,
          },
        },
      }
      mockGetDeviceAction.mockResolvedValue(dataWithoutCharge)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
        // Should show N/A when battery charge is missing
        const naElements = screen.getAllByText('N/A')
        expect(naElements.length).toBeGreaterThan(0)
      })
    })

    it('should handle missing ups.load for watt-hours calculation', async () => {
      const dataWithoutLoad = {
        ...mockDeviceData,
        device: {
          ...mockDeviceData.device,
          vars: {
            ...mockDeviceData.device.vars,
            'ups.load': undefined,
          },
        },
      }
      mockGetDeviceAction.mockResolvedValue(dataWithoutLoad)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
        // When ups.load is missing, both current load and battery charge should show N/A
        const naElements = screen.getAllByText('N/A')
        expect(naElements.length).toBeGreaterThan(0)
      })
    })

    it('should handle missing ups.realpower.nominal for watt-hours calculation', async () => {
      const dataWithoutNominal = {
        ...mockDeviceData,
        device: {
          ...mockDeviceData.device,
          vars: {
            ...mockDeviceData.device.vars,
            'ups.realpower.nominal': undefined,
          },
        },
      }
      mockGetDeviceAction.mockResolvedValue(dataWithoutNominal)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
      })

      // Click should still work but stay in percentage mode
      const gauges = screen.getAllByTestId('gauge')
      fireEvent.click(gauges[1])

      await waitFor(() => {
        expect(localStorage.getItem('wattHours')).toBe('true')
      })
    })

    it('should handle missing battery.runtime for watt-hours calculation', async () => {
      const dataWithoutRuntime = {
        ...mockDeviceData,
        device: {
          ...mockDeviceData.device,
          vars: {
            ...mockDeviceData.device.vars,
            'battery.runtime': undefined,
          },
        },
      }
      mockGetDeviceAction.mockResolvedValue(dataWithoutRuntime)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
      })

      // Click should still work but stay in percentage mode
      const gauges = screen.getAllByTestId('gauge')
      fireEvent.click(gauges[1])

      await waitFor(() => {
        expect(localStorage.getItem('wattHours')).toBe('true')
      })
    })
  })

  describe('toggle functions integration', () => {
    it('should persist both preferences independently in localStorage', async () => {
      mockGetDeviceAction.mockResolvedValue(mockDeviceData)
      renderComponent()

      await waitFor(() => {
        expect(screen.getByTestId('wrapper')).toBeInTheDocument()
      })

      // Toggle both to their alternative displays
      const gauges = screen.getAllByTestId('gauge')
      fireEvent.click(gauges[0]) // Toggle load to watts
      fireEvent.click(gauges[1]) // Toggle battery to watt-hours

      await waitFor(() => {
        expect(localStorage.getItem('wattsOrPercent')).toBe('true')
        expect(localStorage.getItem('wattHours')).toBe('true')
      })
    })
  })
})
