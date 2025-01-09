import React from 'react'
import { render } from '@testing-library/react'
import VoltsChart from '@/client/components/line-charts/volts-chart'
import { DEVICE } from '@/common/types'

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
  rwVars: [],
  commands: [],
  description: 'test',
  clients: [],
  name: 'test',
}

describe('Line', () => {
  it('renders', () => {
    const vars = device.vars
    const { getByTestId } = render(
      <VoltsChart
        id={device.name}
        inputVoltage={+vars['input.voltage'].value}
        inputVoltageNominal={+vars['input.voltage.nominal']?.value}
        outputVoltage={+vars['output.voltage']?.value}
        updated={new Date()}
      />
    )

    expect(getByTestId('volts-chart')).toBeInTheDocument()
  })
})
