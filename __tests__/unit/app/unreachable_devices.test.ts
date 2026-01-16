import { Nut } from '@/server/nut'
import { getDevices } from '@/app/actions'
import { YamlSettings, SettingsType } from '@/server/settings'
import { upsStatus, parseUpsStatus } from '@/common/constants'

// Mock Nut
jest.mock('@/server/nut')
// Mock Settings
jest.mock('@/server/settings')

describe('getDevices unreachable handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not provide a placeholder device when a server is unreachable', async () => {
    // Mock settings to return one server
    ;(YamlSettings.prototype.get as jest.Mock).mockImplementation((key: keyof SettingsType) => {
      if (key === 'NUT_SERVERS') {
        return [{ NAME: 'FailedServer', HOST: '1.2.3.4', PORT: 3493, DISABLED: false }]
      }
      return undefined
    })

    // Mock Nut to fail connection
    ;(Nut.prototype.testConnection as jest.Mock).mockRejectedValue(new Error('Connection failed'))
    ;(Nut.prototype.getHost as jest.Mock).mockReturnValue('1.2.3.4')
    ;(Nut.prototype.getPort as jest.Mock).mockReturnValue(3493)
    ;(Nut.prototype.getName as jest.Mock).mockReturnValue('FailedServer')

    const data = await getDevices()

    expect(data.devices).toHaveLength(0)
    expect(data.failedServers).toContain('1.2.3.4:3493')
  })

  it('handles individual device failure on a reachable server', async () => {
    // Mock settings
    ;(YamlSettings.prototype.get as jest.Mock).mockImplementation((key: keyof SettingsType) => {
      if (key === 'NUT_SERVERS') {
        return [{ NAME: 'MixedServer', HOST: '1.2.3.5', PORT: 3493, DISABLED: false }]
      }
      return undefined
    })

    // Mock Nut behavior
    ;(Nut.prototype.testConnection as jest.Mock).mockResolvedValue('OK')
    ;(Nut.prototype.getDevices as jest.Mock).mockResolvedValue([
      { name: 'ups1', description: 'UPS 1', rwVars: [], commands: [], clients: [], vars: {} },
    ])
    ;(Nut.prototype.getHost as jest.Mock).mockReturnValue('1.2.3.5')
    ;(Nut.prototype.getPort as jest.Mock).mockReturnValue(3493)
    ;(Nut.prototype.getName as jest.Mock).mockReturnValue('MixedServer')

    // Mock getData to fail for this device
    ;(Nut.prototype.getData as jest.Mock).mockRejectedValue(new Error('Device error'))

    const data = await getDevices()

    expect(data.devices).toHaveLength(1)
    expect(data.devices![0].name).toBe('ups1')
    expect(data.devices![0].vars['ups.status'].value).toBe(upsStatus.DEVICE_UNREACHABLE)
  })

  describe('parseUpsStatus', () => {
    it('does not add a comma to "Device Unreachable"', () => {
      const result = parseUpsStatus(upsStatus.DEVICE_UNREACHABLE)
      expect(result).toBe('Device Unreachable')
    })

    it('still parses combined status codes correctly', () => {
      const result = parseUpsStatus('OL CHRG')
      expect(result).toBe('Online, Battery Charging')
    })
  })
})
