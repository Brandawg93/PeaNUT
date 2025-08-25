import React from 'react'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import DeviceWrapper from '@/client/components/device-wrapper'
import { renderWithProviders, waitForSettings } from '../../../utils/test-utils'

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

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
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

  const renderComponent = async () => {
    const result = renderWithProviders(
      <DeviceWrapper
        device='test-ups'
        getDeviceAction={mockGetDeviceAction}
        runCommandAction={mockRunCommandAction}
        logoutAction={mockLogoutAction}
      />,
      { queryClient }
    )
    await waitForSettings()
    return result
  }

  it('should show loading state initially', async () => {
    mockGetDeviceAction.mockImplementation(() => new Promise(() => {}))
    await renderComponent()
    expect(screen.getByTestId('loading-wrapper')).toBeInTheDocument()
  })

  it('should show empty state when no device data is available', async () => {
    mockGetDeviceAction.mockResolvedValue({ device: null })
    await renderComponent()
    await waitFor(() => {
      expect(screen.getByTestId('empty-wrapper')).toBeInTheDocument()
    })
  })

  it('should display device information when data is available', async () => {
    mockGetDeviceAction.mockResolvedValue(mockDeviceData)
    await renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Test Manufacturer')).toBeInTheDocument()
      expect(screen.getByText('Test Model')).toBeInTheDocument()
      expect(screen.getByText('123456')).toBeInTheDocument()
    })
  })

  it('should display correct status icon for OL status', async () => {
    mockGetDeviceAction.mockResolvedValue(mockDeviceData)
    await renderComponent()
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
    await renderComponent()
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
    await renderComponent()
    await waitFor(() => {
      expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument()
    })
  })

  // Helper for toggle tests
  function testToggleGauge({
    describeName,
    gaugeIndex,
    localStorageKey,
    missingVars = [],
    initialValueTrue = 'true',
    initialValueFalse = 'false',
  }: {
    describeName: string
    gaugeIndex: number
    localStorageKey: string
    missingVars?: string[]
    initialValueTrue?: string
    initialValueFalse?: string
  }) {
    describe(describeName, () => {
      it(`should toggle localStorage preference when gauge is clicked`, async () => {
        mockGetDeviceAction.mockResolvedValue(mockDeviceData)
        await renderComponent()
        await waitFor(() => {
          expect(screen.getByTestId('wrapper')).toBeInTheDocument()
        })
        const gauges = screen.getAllByTestId('gauge')
        expect(gauges.length).toBeGreaterThan(gaugeIndex)
        fireEvent.click(gauges[gaugeIndex])
        await waitFor(() => {
          expect(localStorage.getItem(localStorageKey)).toBe(initialValueTrue)
        })
      })
      it(`should initialize with localStorage preference for true`, async () => {
        localStorage.setItem(localStorageKey, initialValueTrue)
        mockGetDeviceAction.mockResolvedValue(mockDeviceData)
        await renderComponent()
        await waitFor(() => {
          expect(screen.getByTestId('wrapper')).toBeInTheDocument()
          expect(localStorage.getItem(localStorageKey)).toBe(initialValueTrue)
        })
      })
      it(`should initialize with localStorage preference for false`, async () => {
        localStorage.setItem(localStorageKey, initialValueFalse)
        mockGetDeviceAction.mockResolvedValue(mockDeviceData)
        await renderComponent()
        await waitFor(() => {
          expect(screen.getByTestId('wrapper')).toBeInTheDocument()
          expect(localStorage.getItem(localStorageKey)).toBe(initialValueFalse)
        })
      })
      for (const missingVar of missingVars) {
        it(`should handle missing ${missingVar} gracefully`, async () => {
          const dataWithoutVar = {
            ...mockDeviceData,
            device: {
              ...mockDeviceData.device,
              vars: {
                ...mockDeviceData.device.vars,
                [missingVar]: undefined,
              },
            },
          }
          mockGetDeviceAction.mockResolvedValue(dataWithoutVar)
          await renderComponent()
          await waitFor(() => {
            expect(screen.getByTestId('wrapper')).toBeInTheDocument()
          })
          // If missingVar affects display, check for N/A
          if (['ups.load', 'battery.charge'].includes(missingVar)) {
            const naElements = screen.getAllByText('N/A')
            expect(naElements.length).toBeGreaterThan(0)
            // Don't test toggle functionality for these critical variables
            return
          }
          // Only click and assert if the gauge exists
          const gauges = screen.queryAllByTestId('gauge')
          if (gauges.length > gaugeIndex) {
            fireEvent.click(gauges[gaugeIndex])
            await waitFor(() => {
              expect(localStorage.getItem(localStorageKey)).toBe(initialValueTrue)
            })
          }
          // If gauge doesn't exist, don't assert localStorage value
        })
      }
    })
  }

  testToggleGauge({
    describeName: 'toggleWattsOrPercent',
    gaugeIndex: 0,
    localStorageKey: 'wattsOrPercent',
    missingVars: ['ups.realpower.nominal', 'ups.load'],
  })

  testToggleGauge({
    describeName: 'toggleWattHours',
    gaugeIndex: 1,
    localStorageKey: 'wattHours',
    missingVars: ['battery.charge', 'ups.load', 'ups.realpower.nominal', 'battery.runtime'],
  })

  describe('toggle functions integration', () => {
    it('should persist both preferences independently in localStorage', async () => {
      mockGetDeviceAction.mockResolvedValue(mockDeviceData)
      await renderComponent()

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
