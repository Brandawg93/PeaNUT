import { getDevices } from '@/app/actions'
import { DEVICE } from '@/common/types'
import { Nut } from '@/server/nut'

beforeAll(() => {
  jest.spyOn(Nut.prototype, 'connect').mockResolvedValue()
  jest.spyOn(Nut.prototype, 'close').mockResolvedValue()
  jest.spyOn(Nut.prototype, 'getDevices').mockResolvedValue([{ name: 'foo', description: 'bar' }])
  jest.spyOn(Nut.prototype, 'getData').mockResolvedValue({ 'battery.charge': '100' } as DEVICE)
})

describe('actions', () => {
  it('gets devices', () => {
    expect(getDevices()).resolves.toEqual([{ 'battery.charge': '100' }])
  })

  it('gets devices without env variables', () => {
    process.env.NUT_HOST = ''
    process.env.NUT_PORT = ''
    expect(getDevices()).resolves.toEqual([{ 'battery.charge': '100' }])
  })
})
