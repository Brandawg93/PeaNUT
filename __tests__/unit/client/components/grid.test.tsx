import { render } from '@testing-library/react'
import NutGrid from '@/client/components/grid'
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

describe('Grid', () => {
  beforeAll(() => {
    jest.mock('../../../../src/app/actions', () => ({
      getAllVarDescriptions: jest.fn(),
    }))
  })

  it('renders', () => {
    const { getByTestId } = render(<NutGrid data={device} />)

    expect(getByTestId('grid')).toBeInTheDocument()
  })
})
