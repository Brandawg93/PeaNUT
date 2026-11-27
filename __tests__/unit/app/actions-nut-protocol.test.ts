import { createServer, Server, Socket } from 'node:net'
import { AddressInfo } from 'node:net'
import { getDevice, getDevices } from '@/app/actions'
import { nutConnectionPool } from '@/server/nut-pool'
import { upsStatus } from '@/common/constants'

// Keep the action, cache, NUT client, and socket implementations real. Only external
// configuration/auth services are replaced; errors below arrive over actual TCP.
let mockPort: number
jest.mock('@/server/settings', () => ({
  YamlSettings: jest.fn().mockImplementation(() => ({
    get: (key: string) =>
      key === 'NUT_SERVERS'
        ? [{ HOST: '127.0.0.1', PORT: mockPort, USERNAME: 'reader', PASSWORD: 'secret' }]
        : undefined,
  })),
}))
jest.mock('@/auth', () => ({ signIn: jest.fn(), signOut: jest.fn() }))
jest.mock('@/server/influxdb', () => ({ __esModule: true, default: jest.fn() }))
jest.mock('chokidar', () => ({ watch: () => ({ on: jest.fn() }) }))

const variables = {
  'battery.charge': { value: 98, description: 'Battery charge' },
  'ups.status': { value: 'OL', description: 'UPS status' },
}
const commands = ['beeper.disable']
const rwVars = ['battery.charge']
const requests: string[] = []
let rejectedCommands: Set<string>
let server: Server
const sockets = new Set<Socket>()

function reply(command: string): string {
  const [verb, kind, device, variable] = command.split(' ')
  if (device === 'upst01' && rejectedCommands.has(`${verb} ${kind}`)) {
    return 'ERR INVALID-ARGUMENT\n'
  }
  switch (`${verb} ${kind}`) {
    case 'LIST UPS':
      return 'BEGIN LIST UPS\nUPS upst01 "UniFi UPS"\nUPS healthy "Healthy UPS"\nEND LIST UPS\n'
    case 'LIST VAR':
      return `BEGIN ${command}\nVAR ${device} battery.charge "98"\nVAR ${device} ups.status "OL"\nEND ${command}\n`
    case 'GET DESC':
      return `DESC ${device} ${variable} "${variable === 'battery.charge' ? 'Battery charge' : 'UPS status'}"\n`
    case 'GET TYPE':
      return `TYPE ${device} ${variable} ${variable === 'battery.charge' ? 'NUMBER' : 'STRING'}\n`
    case 'LIST RW':
      return `BEGIN ${command}\nRW ${device} battery.charge "98"\nEND ${command}\n`
    case 'LIST CMD':
      return `BEGIN ${command}\nCMD ${device} beeper.disable\nEND ${command}\n`
    case 'GET UPSDESC':
      return `UPSDESC ${device} "UniFi UPS"\n`
    default:
      throw new Error(`Unexpected NUT command: ${command}`)
  }
}

beforeAll(async () => {
  server = createServer((socket) => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
    socket.setEncoding('utf8')
    let pending = ''
    socket.on('data', (chunk) => {
      pending += chunk
      let newline: number
      while ((newline = pending.indexOf('\n')) !== -1) {
        const command = pending.slice(0, newline)
        pending = pending.slice(newline + 1)
        requests.push(command)
        if (command === 'LOGOUT') socket.end('OK Goodbye\n')
        else socket.write(reply(command))
      }
    })
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  mockPort = (server.address() as AddressInfo).port
})

beforeEach(() => {
  rejectedCommands = new Set()
  requests.length = 0
})

afterEach(async () => {
  await nutConnectionPool.drain()
})

afterAll(async () => {
  sockets.forEach((socket) => socket.destroy())
  await new Promise<void>((resolve) => server.close(() => resolve()))
})

describe.each([
  { label: 'overview', load: async () => (await getDevices()).devices! },
  { label: 'device detail', load: async () => [(await getDevice('upst01')).device!] },
])('$label with a UniFi-like NUT server (#470)', ({ load, label }) => {
  it('discovers capabilities again after a previously rejected lookup recovers', async () => {
    rejectedCommands = new Set(['LIST RW', 'LIST CMD'])
    const degraded = (await load()).find((entry) => entry.name === 'upst01')!
    expect(degraded).toMatchObject({ vars: variables, rwVars: [], commands: [] })
    rejectedCommands.clear()
    const recovered = (await load()).find((entry) => entry.name === 'upst01')!
    expect(recovered).toMatchObject({ vars: variables, rwVars, commands })
  })

  it('marks unavailable primary data unreachable and skips optional discovery', async () => {
    rejectedCommands = new Set(['LIST VAR'])
    const device = (await load()).find((entry) => entry.name === 'upst01')!
    expect(device.vars['ups.status'].value).toBe(upsStatus.DEVICE_UNREACHABLE)
    expect(device).toMatchObject({ rwVars: [], commands: [] })
    expect(requests).not.toContain('LIST RW upst01')
    expect(requests).not.toContain('LIST CMD upst01')
    expect(requests).not.toContain('GET UPSDESC upst01')
  })

  it.each([
    { failing: [] },
    { failing: ['LIST RW'] },
    { failing: ['LIST CMD'] },
    { failing: ['GET UPSDESC'] },
    { failing: ['LIST RW', 'LIST CMD', 'GET UPSDESC'] },
  ])('preserves live data when optional commands fail: $failing', async ({ failing }) => {
    rejectedCommands = new Set(failing)
    const devices = await load()
    const device = devices.find((entry) => entry.name === 'upst01')!
    expect(device.vars).toEqual(variables)
    expect(device.rwVars).toEqual(rejectedCommands.has('LIST RW') ? [] : rwVars)
    expect(device.commands).toEqual(rejectedCommands.has('LIST CMD') ? [] : commands)
    expect(device.description).toBe(label === 'device detail' && rejectedCommands.has('GET UPSDESC') ? '' : 'UniFi UPS')
    expect(requests).toEqual(expect.arrayContaining(['LIST RW upst01', 'LIST CMD upst01']))
    if (label === 'overview') {
      expect(devices.find((entry) => entry.name === 'healthy')).toMatchObject({
        vars: variables,
        rwVars,
        commands,
        description: 'Healthy UPS',
      })
    } else {
      expect(requests).toContain('GET UPSDESC upst01')
    }
  })
})
