import { getAllVarDescriptions, getDevices } from '@/app/actions'
import { DEVICE, VARS } from '@/common/types'
import { Nut } from '@/server/nut'

const vars: VARS = {}

const result: Array<DEVICE> = [
  {
    clients: [],
    commands: [],
    description: 'bar',
    name: 'foo',
    rwVars: ['battery.charge'],
    vars: {},
  },
]

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
  jest.spyOn(Nut.prototype, 'getVarDescription').mockResolvedValue('test')
})

describe('actions', () => {
  it('gets devices', async () => {
    const data = await getDevices()
    expect(data.devices).toEqual(result)
  })

  it('gets devices without env variables', async () => {
    process.env.NUT_HOST = ''
    process.env.NUT_PORT = ''
    const data = await getDevices()
    expect(data.devices).toEqual(result)
  })

  it('gets all var descriptions', async () => {
    const data = await getAllVarDescriptions('ups', ['battery.charge'])
    expect(data?.data && data.data['battery.charge']).toEqual('test')
  })
})
