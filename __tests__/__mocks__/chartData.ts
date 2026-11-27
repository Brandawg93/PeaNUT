import { DEVICE } from '@/common/types'

export const device: DEVICE = {
  id: 'localhost:3493/test',
  name: 'test',
  server: 'localhost:3493',
  vars: {
    'input.voltage': {
      value: '1',
    },
    'ambient.temperature': {
      value: '22',
    },
    'battery.temperature': {
      value: '24',
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
    'ups.power': {
      value: '100',
    },
    'ups.power.nominal': {
      value: '150',
    },
    'ups.realpower': {
      value: '80',
    },
    'ups.realpower.nominal': {
      value: '120',
    },
  },
  rwVars: [],
  commands: [],
  description: 'test',
  clients: [],
}
