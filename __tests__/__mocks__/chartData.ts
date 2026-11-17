import { DEVICE } from '@/common/types'

// Three-phase snmp-ups readings from issue #482.
export const threePhaseVars: DEVICE['vars'] = {
  'output.phases': { value: 3 },
  'output.L1.power.percent': { value: 8 },
  'output.L2.power.percent': { value: 11 },
  'output.L3.power.percent': { value: 9 },
  'output.L1.realpower': { value: 4600 },
  'output.L2.realpower': { value: 6600 },
  'output.L3.realpower': { value: 5400 },
  'output.realpower.nominal': { value: 180000 },
}

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
