import React from 'react'
import { render } from '@testing-library/react'
import VoltsChart from '@/client/components/line-charts/volts-chart'
import { DEVICE } from '@/common/types'

const device: DEVICE = {
  vars: {
    'input.voltage': {
      value: '1',
    },
    'device.serial': {
      value: 'test',
    },
    'input.voltage.nominal': {
      value: '1',
    },
    'output.voltage': {
      value: '1',
    },
  },
  rwVars: [],
  commands: [],
  description: 'test',
  clients: [],
  name: 'test',
}

describe('Volts', () => {
  it('renders', () => {
    const vars = device.vars
    const chart = (
      <VoltsChart
        id={device.name}
        inputVoltage={+vars['input.voltage'].value}
        inputVoltageNominal={+vars['input.voltage.nominal']?.value}
        outputVoltage={+vars['output.voltage']?.value}
        updated={new Date()}
      />
    )
    const { getByTestId } = render(chart)
    expect(getByTestId('volts-chart')).toBeInTheDocument()
  })

  it('renders with no output voltage', () => {
    const vars = { ...device.vars }
    delete vars['output.voltage']
    const chart = (
      <VoltsChart
        id={device.name}
        inputVoltage={+vars['input.voltage'].value}
        inputVoltageNominal={+vars['input.voltage.nominal']?.value}
        outputVoltage={+vars['output.voltage']?.value}
        updated={new Date()}
      />
    )
    const { getByTestId } = render(chart)
    expect(getByTestId('volts-chart')).toBeInTheDocument()
  })
})
