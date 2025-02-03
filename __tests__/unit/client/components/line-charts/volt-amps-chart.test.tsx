import React from 'react'
import { render } from '@testing-library/react'
import VoltAmpsChart from '@/client/components/line-charts/volt-amps-chart'
import { DEVICE } from '@/common/types'

const device: DEVICE = {
  vars: {
    'ups.power': {
      value: '1',
    },
    'device.serial': {
      value: 'test',
    },
    'ups.power.nominal': {
      value: '1',
    },
  },
  rwVars: [],
  commands: [],
  description: 'test',
  clients: [],
  name: 'test',
}

describe('VoltAmps', () => {
  it('renders', () => {
    const vars = device.vars
    const chart = (
      <VoltAmpsChart
        id={device.name}
        power={+vars['ups.power'].value}
        powerNominal={+vars['ups.power.nominal']?.value}
        updated={new Date()}
      />
    )
    const { getByTestId } = render(chart)
    expect(getByTestId('volt-amps-chart')).toBeInTheDocument()
  })
})
