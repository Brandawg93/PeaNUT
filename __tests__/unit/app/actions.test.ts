import { getDevices } from '@/app/actions'
import { VARS } from '@/common/types'
import { Nut } from '@/server/nut'

const vars: VARS = {}

const result = {
  data: [
    {
      clients: [],
      commands: [],
      description: '',
      name: 'foo',
      rwVars: ['battery.charge'],
      vars: {},
    },
  ],
  message: '',
}

beforeAll(() => {
  jest.spyOn(Nut.prototype, 'connect').mockResolvedValue()
  jest.spyOn(Nut.prototype, 'close').mockResolvedValue()
  jest
    .spyOn(Nut.prototype, 'getDevices')
    .mockResolvedValue([
      { name: 'foo', description: 'bar', rwVars: ['battery.charge'], vars: {}, commands: [], clients: [] },
    ])
  jest.spyOn(Nut.prototype, 'getData').mockResolvedValue(vars)
  jest.spyOn(Nut.prototype, 'getRWVars').mockResolvedValue(['battery.charge'])
})

describe('actions', () => {
  it('gets devices', () => {
    expect(getDevices()).resolves.toEqual(result)
  })

  it('gets devices without env variables', () => {
    process.env.NUT_HOST = ''
    process.env.NUT_PORT = ''
    expect(getDevices()).resolves.toEqual(result)
  })
})
