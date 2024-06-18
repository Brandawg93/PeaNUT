import { render } from '@testing-library/react'
import LineChart from '@/client/components/line-chart'
import { DEVICE } from '@/common/types'

jest.mock('react-chartjs-2', () => ({
  Line: () => null,
}))

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
      <LineChart
        serial={vars['device.serial']?.value}
        inputVoltage={parseFloat(vars['input.voltage'].value as string)}
        inputVoltageNominal={parseFloat(vars['input.voltage.nominal']?.value as string)}
        outputVoltage={parseFloat(vars['output.voltage']?.value as string)}
        updated={new Date()}
      />
    )

    expect(getByTestId('line')).toBeInTheDocument()
  })
})
