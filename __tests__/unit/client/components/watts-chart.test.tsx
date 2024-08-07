import React from 'react'
import { render } from '@testing-library/react'
import WattsChart from '@/client/components/watts-chart'
import { DEVICE } from '@/common/types'

jest.mock('react-chartjs-2', () => ({
  Line: () => null,
}))

const device: DEVICE = {
  vars: {
    'ups.realpower': {
      value: '0',
    },
    'device.serial': {
      value: 'test',
    },
    'ups.realpower.nominal': {
      value: '0',
    },
  },
  rwVars: [],
  commands: [],
  description: 'test',
  clients: [],
  name: 'test',
}

describe('Gauge', () => {
  it('renders', () => {
    const vars = device.vars
    const { getByTestId } = render(
      <WattsChart
        id={device.name}
        realpower={parseFloat(vars['ups.realpower'].value as string)}
        realpowerNominal={parseFloat(vars['ups.realpower.nominal']?.value as string)}
        updated={new Date()}
      />
    )

    expect(getByTestId('watts')).toBeInTheDocument()
  })
})
