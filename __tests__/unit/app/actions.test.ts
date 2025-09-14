import { TextDecoder } from 'util'
import { DEVICE, VARS } from '@/common/types'
import { Nut } from '@/server/nut'
import {
  getAllVarDescriptions,
  getDevices,
  testConnection,
  testInfluxConnection,
  saveVar,
  checkSettings,
  getSettings,
  setSettings,
  deleteSettings,
  disconnect,
  getAllCommands,
  runCommand,
  exportSettings,
  importSettings,
  updateServers,
  getDevice,
  authenticate,
} from '@/app/actions'
import { YamlSettings, SettingsType } from '@/server/settings'
import PromiseSocket from '@/server/promise-socket'
import InfluxWriter from '@/server/influxdb'
import { signIn } from '@/auth'
import { TEST_USERNAME, TEST_PASSWORD, TEST_HOSTNAME, TEST_PORT } from '../../utils/test-constants'
import { AuthError } from 'next-auth'

global.TextDecoder = TextDecoder as any
global.fetch = jest.fn(() => Promise.resolve({})) as jest.Mock

// Mock auth
jest.mock('@/auth', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  auth: jest.fn(),
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}))

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
  jest
    .spyOn(Nut.prototype, 'getDevices')
    .mockResolvedValue([
      { name: 'foo', description: 'bar', rwVars: ['battery.charge'], vars: {}, commands: [], clients: [] },
    ])
  jest.spyOn(Nut.prototype, 'getData').mockResolvedValue(vars)
  jest.spyOn(Nut.prototype, 'getRWVars').mockResolvedValue(['battery.charge'])
  jest.spyOn(Nut.prototype, 'getCommands').mockResolvedValue([])
  jest.spyOn(Nut.prototype, 'getVarDescription').mockResolvedValue('test')
  jest.spyOn(Nut.prototype, 'setVar').mockResolvedValue()
  jest.spyOn(Nut.prototype, 'checkCredentials').mockResolvedValue()
  jest.spyOn(Nut.prototype, 'testConnection').mockResolvedValue('Connection successful')
  jest.spyOn(Nut.prototype, 'getDescription').mockResolvedValue('bar')
  jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
  jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
  jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
  jest.spyOn(InfluxWriter.prototype, 'testConnection').mockResolvedValue(void 0)
  jest.spyOn(YamlSettings.prototype, 'get').mockImplementation((key: keyof SettingsType) => {
    const settings = {
      NUT_SERVERS: [
        { HOST: TEST_HOSTNAME, PORT: TEST_PORT, USERNAME: TEST_USERNAME, PASSWORD: undefined, DISABLED: false },
      ],
    }
    return settings[key as keyof typeof settings]
  })
  jest.spyOn(YamlSettings.prototype, 'set').mockImplementation(() => true)
  jest.spyOn(YamlSettings.prototype, 'delete').mockImplementation(() => true)
  jest.spyOn(Nut.prototype, 'deviceExists').mockResolvedValue(true)
  jest.spyOn(Nut.prototype, 'runCommand').mockResolvedValue()
  jest.spyOn(YamlSettings.prototype, 'export').mockReturnValue('exported yaml')
  jest.spyOn(YamlSettings.prototype, 'import').mockImplementation()
})

describe('actions', () => {
  it('gets devices', async () => {
    const data = await getDevices()
    expect(data.devices).toEqual(result)
  })

  it('gets all var descriptions', async () => {
    const data = await getAllVarDescriptions('ups', ['battery.charge'])
    expect(data?.data?.['battery.charge']).toEqual('test')
  })

  it('tests connection', async () => {
    await expect(testConnection(TEST_HOSTNAME, TEST_PORT)).resolves.toBe('Connection successful')
  })

  it('saves variable', async () => {
    const data = await saveVar('ups', 'battery.charge', '100')
    expect(data.error).toBeUndefined()
  })

  it('checks settings', async () => {
    const data = await checkSettings()
    expect(data).toBe(true)
  })

  it('gets settings', async () => {
    const data = await getSettings('NUT_SERVERS')
    expect(data[0].HOST).toBe(TEST_HOSTNAME)
  })

  it('sets settings', async () => {
    await setSettings('INFLUX_INTERVAL', 10)
    expect(YamlSettings.prototype.set).toHaveBeenCalledWith('INFLUX_INTERVAL', 10)
  })

  it('deletes settings', async () => {
    await deleteSettings('INFLUX_INTERVAL')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('INFLUX_INTERVAL')
  })

  it('disconnects', async () => {
    await disconnect()
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('NUT_SERVERS')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('INFLUX_HOST')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('INFLUX_TOKEN')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('INFLUX_ORG')
    expect(YamlSettings.prototype.delete).toHaveBeenCalledWith('INFLUX_BUCKET')
  })

  it('tests influx connection', async () => {
    const result = await testInfluxConnection('http://localhost:8086', 'token123', 'myorg', 'mybucket')
    expect(result).toBe(void 0)
    expect(InfluxWriter.prototype.testConnection).toHaveBeenCalled()
  })

  it('gets all commands for a device', async () => {
    const commands = await getAllCommands('ups')
    expect(commands).toEqual([]) // Empty array since our mock returns empty array
    expect(Nut.prototype.getCommands).toHaveBeenCalledWith('ups')
  })

  it('runs a command on a device', async () => {
    const result = await runCommand('ups', 'test.battery.start')
    expect(result.error).toBeUndefined()
    expect(Nut.prototype.runCommand).toHaveBeenCalledWith('test.battery.start', 'ups')
  })

  it('exports settings', async () => {
    const result = await exportSettings()
    expect(result).toBe('exported yaml')
    expect(YamlSettings.prototype.export).toHaveBeenCalled()
  })

  it('imports settings', async () => {
    const settingsYaml = 'imported yaml'
    await importSettings(settingsYaml)
    expect(YamlSettings.prototype.import).toHaveBeenCalledWith(settingsYaml)
  })

  it('updates servers', async () => {
    const servers = [
      { HOST: TEST_HOSTNAME, PORT: TEST_PORT, USERNAME: TEST_USERNAME, PASSWORD: undefined, DISABLED: false },
      { HOST: 'remote', PORT: TEST_PORT, USERNAME: TEST_USERNAME, PASSWORD: TEST_PASSWORD, DISABLED: true },
    ]
    await updateServers(servers)
    expect(YamlSettings.prototype.set).toHaveBeenCalledWith('NUT_SERVERS', servers)
  })

  it('skips disabled servers when getting devices', async () => {
    ;(YamlSettings.prototype.get as jest.Mock).mockImplementationOnce((key: keyof SettingsType) => {
      const settings = {
        NUT_SERVERS: [
          { HOST: 'enabled', PORT: TEST_PORT, USERNAME: TEST_USERNAME, PASSWORD: undefined, DISABLED: false },
          { HOST: 'disabled', PORT: TEST_PORT, USERNAME: TEST_USERNAME, PASSWORD: undefined, DISABLED: true },
        ],
      }
      return settings[key as keyof typeof settings]
    })

    // Clear previous call counts
    ;(Nut.prototype.testConnection as jest.Mock).mockClear()

    await getDevices()

    // testConnection should be called only for enabled servers (1 call)
    expect((Nut.prototype.testConnection as jest.Mock).mock.calls.length).toBe(1)
  })

  it('gets a single device', async () => {
    const deviceData = await getDevice('foo')
    expect(deviceData.device).toEqual({
      vars: {},
      rwVars: ['battery.charge'],
      description: 'bar',
      clients: [],
      commands: [],
      name: 'foo',
    })
    expect(deviceData.updated).toBeInstanceOf(Date)
    expect(Nut.prototype.getData).toHaveBeenCalledWith('foo')
    expect(Nut.prototype.getRWVars).toHaveBeenCalledWith('foo')
    expect(Nut.prototype.getCommands).toHaveBeenCalledWith('foo')
    expect(Nut.prototype.getDescription).toHaveBeenCalledWith('foo')
  })

  describe('authenticate', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('successfully authenticates', async () => {
      const formData = new FormData()
      formData.append('username', TEST_USERNAME)
      formData.append('password', TEST_PASSWORD)
      await authenticate(undefined, formData)
      expect(signIn).toHaveBeenCalledWith('credentials', formData)
    })

    it('handles invalid credentials error', async () => {
      const formData = new FormData()
      formData.append('username', TEST_USERNAME)
      formData.append('password', 'wrong')

      const authError = new AuthError('CredentialsSignin')
      ;(signIn as jest.Mock).mockRejectedValueOnce(authError)

      const result = await authenticate(undefined, formData)
      expect(result).toBe('Invalid credentials.')
    })

    it('handles generic auth error', async () => {
      const formData = new FormData()
      formData.append('username', TEST_USERNAME)
      formData.append('password', TEST_PASSWORD)

      const authError = new AuthError('Some other error')
      ;(signIn as jest.Mock).mockRejectedValueOnce(authError)

      const result = await authenticate(undefined, formData)
      expect(result).toBe('Something went wrong.')
    })
  })
})
