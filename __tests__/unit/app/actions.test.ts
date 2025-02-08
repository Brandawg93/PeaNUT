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
} from '@/app/actions'
import { YamlSettings, SettingsType } from '@/server/settings'
import PromiseSocket from '@/server/promise-socket'
import InfluxWriter from '@/server/influxdb'

global.TextDecoder = TextDecoder as any
global.fetch = jest.fn(() => Promise.resolve({})) as jest.Mock

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
  jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
  jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
  jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
  jest.spyOn(InfluxWriter.prototype, 'testConnection').mockResolvedValue(void 0)
  jest.spyOn(YamlSettings.prototype, 'get').mockImplementation((key: keyof SettingsType) => {
    const settings = {
      NUT_SERVERS: [{ HOST: 'localhost', PORT: 3493, USERNAME: 'user', PASSWORD: 'pass' }],
    }
    return settings[key as keyof typeof settings]
  })
  jest.spyOn(YamlSettings.prototype, 'set').mockImplementation(() => {})
  jest.spyOn(YamlSettings.prototype, 'delete').mockImplementation(() => {})
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

  it('tests connection', () => {
    expect(testConnection('localhost', 3493)).resolves.toBe('Connection successful')
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
    expect(data[0].HOST).toBe('localhost')
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
    expect(Nut.prototype.runCommand).toHaveBeenCalledWith('ups', 'test.battery.start')
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
      { HOST: 'localhost', PORT: 3493, USERNAME: 'user', PASSWORD: 'pass' },
      { HOST: 'remote', PORT: 3493, USERNAME: 'admin', PASSWORD: 'secret' },
    ]
    await updateServers(servers)
    expect(YamlSettings.prototype.set).toHaveBeenCalledWith('NUT_SERVERS', servers)
  })
})
