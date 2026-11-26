import { NextRequest } from 'next/server'
import { getNutInstances } from '@/app/api/utils'
import { GET } from '@/app/api/v1/metrics/route'
import { upsStatus } from '@/common/constants'
import { Nut } from '@/server/nut'

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: class {
    readonly status: number

    constructor(
      private readonly body: string,
      { status = 200 }: ResponseInit = {}
    ) {
      this.status = status
    }

    async text() {
      return this.body
    }
  },
}))

jest.mock('@/app/api/utils', () => ({ getNutInstances: jest.fn() }))

function mockDevice(name: string) {
  return { name, description: '', vars: {}, rwVars: [], commands: [], clients: [] }
}

function mockServer(host: string, name: string, charge: number) {
  const nut = new Nut(host, 3493)
  const getDevices = jest.spyOn(nut, 'getDevices').mockResolvedValue([mockDevice(name)])
  const getData = jest.spyOn(nut, 'getData').mockResolvedValue({ 'battery.charge': { value: charge } })

  return { nut, getDevices, getData }
}

describe('GET /api/v1/metrics', () => {
  const request = new NextRequest('http://localhost/api/v1/metrics')

  it.each(['getDevices', 'getData'] as const)(
    'keeps the healthy server metrics when the other server fails during %s',
    async (operation) => {
      const healthy = mockServer('healthy', 'ups-a', 97)
      const other = mockServer('other', 'ups-b', 42)
      jest.mocked(getNutInstances).mockResolvedValue([other.nut, healthy.nut])
      const healthySample = 'ups_battery_charge{ups="ups-a",server="healthy:3493"} 97'
      const otherSample = 'ups_battery_charge{ups="ups-b",server="other:3493"} 42'

      const before = await GET(request)
      const beforeBody = await before.text()
      expect(before.status).toBe(200)
      expect(beforeBody).toContain(healthySample)
      expect(beforeBody).toContain(otherSample)

      other[operation].mockRejectedValue(new Error('Connection refused'))

      const after = await GET(request)
      const afterBody = await after.text()
      expect(after.status).toBe(200)
      expect(afterBody).toContain(healthySample)
      expect(afterBody).not.toContain('server="other:3493"')
    }
  )

  it('keeps metrics for other UPS devices on the same server when one read fails', async () => {
    const server = mockServer('healthy', 'ups-a', 97)
    server.getDevices.mockResolvedValue([mockDevice('ups-b'), mockDevice('ups-a')])
    server.getData.mockRejectedValueOnce(new Error('Device connection lost'))
    jest.mocked(getNutInstances).mockResolvedValue([server.nut])

    const response = await GET(request)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('ups_battery_charge{ups="ups-a",server="healthy:3493"} 97')
  })

  it.each(['connection error', 'unreachable status'])(
    'fails the scrape when discovery succeeds but every device read fails (%s)',
    async (failure) => {
      const server = mockServer('server', 'ups-a', 97)
      server.getDevices.mockResolvedValue([mockDevice('ups-a'), mockDevice('ups-b')])
      if (failure === 'connection error') {
        server.getData.mockRejectedValue(new Error('Device connection lost'))
      } else {
        server.getData.mockResolvedValue({ 'ups.status': { value: upsStatus.DEVICE_UNREACHABLE } })
      }
      jest.mocked(getNutInstances).mockResolvedValue([server.nut])

      await expect(GET(request)).rejects.toThrow('Failed to collect metrics from any NUT server')
      expect(server.getData).toHaveBeenCalledWith('ups-a')
      expect(server.getData).toHaveBeenCalledWith('ups-b')
    }
  )

  it('returns an empty successful scrape when a device responds with only nonnumeric data', async () => {
    const server = mockServer('server', 'ups-a', 97)
    server.getData.mockResolvedValue({ 'ups.status': { value: 'OL' } })
    jest.mocked(getNutInstances).mockResolvedValue([server.nut])

    const response = await GET(request)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('')
  })

  it('fails the scrape when no configured server can be reached', async () => {
    const first = mockServer('first', 'ups-a', 97)
    const second = mockServer('second', 'ups-b', 42)
    first.getDevices.mockRejectedValue(new Error('Connection refused'))
    second.getDevices.mockRejectedValue(new Error('Connection refused'))
    jest.mocked(getNutInstances).mockResolvedValue([first.nut, second.nut])

    await expect(GET(request)).rejects.toThrow('Failed to collect metrics from any NUT server')
  })
})
