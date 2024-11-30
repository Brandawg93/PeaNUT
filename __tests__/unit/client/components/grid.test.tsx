import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NutGrid from '@/client/components/grid'
import { DEVICE } from '@/common/types'
import PromiseSocket from '@/server/promise-socket'

const queryClient = new QueryClient()

const device: DEVICE = {
  vars: {
    'input.voltage': {
      value: '0',
    },
    'device.serial': {
      value: 'test',
    },
    'input.voltage.nominal': {
      value: '0',
    },
    'output.voltage': {
      value: '0',
    },
  },
  rwVars: ['input.voltage'],
  commands: [],
  description: 'test',
  clients: [],
  name: 'test',
}

describe('Grid', () => {
  beforeAll(() => {
    jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
  })

  it('renders', () => {
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <NutGrid data={device} />
      </QueryClientProvider>
    )

    expect(getByTestId('grid')).toBeInTheDocument()
  })
})
