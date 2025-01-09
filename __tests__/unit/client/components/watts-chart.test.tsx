import React from 'react'
import { render } from '@testing-library/react'
import WattsChart from '@/client/components/line-charts/watts-chart'
import { DEVICE } from '@/common/types'

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
        realpower={+vars['ups.realpower'].value}
        realpowerNominal={+vars['ups.realpower.nominal']?.value}
        updated={new Date()}
      />
    )

    expect(getByTestId('watts-chart')).toBeInTheDocument()
  })
})
