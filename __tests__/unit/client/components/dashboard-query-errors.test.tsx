import React from 'react'
import { fireEvent, screen, waitFor, within, act } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import Wrapper from '@/client/components/wrapper'
import DeviceWrapper from '@/client/components/device-wrapper'
import { renderWithProviders } from '../../../utils/test-utils'

const device = {
  id: 'upst01',
  name: 'upst01',
  description: 'UniFi UPS',
  server: '127.0.0.1:3493',
  vars: { 'ups.status': { value: 'OL' }, 'battery.charge': { value: 98 } },
  rwVars: [],
  commands: [],
  clients: [],
}

describe.each(['overview', 'device detail'])('%s query recovery (#470)', (page) => {
  let queryClient: QueryClient
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })
  afterEach(() => queryClient.clear())

  function renderPage(action: jest.Mock) {
    return renderWithProviders(
      page === 'overview' ? (
        <Wrapper getDevicesAction={action} logoutAction={jest.fn()} />
      ) : (
        <DeviceWrapper device='upst01' getDeviceAction={action} runCommandAction={jest.fn()} logoutAction={jest.fn()} />
      ),
      { queryClient }
    )
  }
  const success = () =>
    page === 'overview' ? { devices: [device], updated: new Date() } : { device, updated: new Date() }

  it('shows a retryable error after rejection and recovers on refresh', async () => {
    const action = jest.fn().mockRejectedValueOnce(new Error('ERR INVALID-ARGUMENT')).mockResolvedValue(success())
    renderPage(action)
    const errorPage = await screen.findByTestId('error-wrapper')
    fireEvent.click(within(errorPage).getByText('refresh', { selector: 'button' }))
    await waitFor(() => expect(screen.queryByTestId('error-wrapper')).not.toBeInTheDocument())
    expect(screen.getByText(/UniFi UPS/)).toBeInTheDocument()
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('retains cached data after a failed refresh and permits a later recovery', async () => {
    const action = jest
      .fn()
      .mockResolvedValueOnce(success())
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(success())
    renderPage(action)
    await screen.findByText(/UniFi UPS/)
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: [page === 'overview' ? 'devicesData' : 'deviceData'] })
    })
    expect(screen.queryByTestId('error-wrapper')).not.toBeInTheDocument()
    expect(screen.getByText(/UniFi UPS/)).toBeInTheDocument()
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: [page === 'overview' ? 'devicesData' : 'deviceData'] })
    })
    expect(action).toHaveBeenCalledTimes(3)
    expect(screen.getByText(/UniFi UPS/)).toBeInTheDocument()
  })
})
