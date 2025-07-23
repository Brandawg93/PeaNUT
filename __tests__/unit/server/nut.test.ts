import { Nut } from '@/server/nut'
import PromiseSocket from '@/server/promise-socket'
import { upsStatus } from '@/common/constants'

const listVarUps = `BEGIN LIST VAR ups
VAR ups battery.charge "100"
VAR ups battery.charge.low "10"
VAR ups battery.charge.warning "20"
VAR ups battery.mfr.date "CPS"
VAR ups battery.runtime "25020"
VAR ups battery.runtime.low "300"
VAR ups battery.type "PbAcid"
VAR ups battery.voltage "24.0"
VAR ups battery.voltage.nominal "24"
VAR ups device.mfr "CPS"
VAR ups device.model "LX1325GU"
VAR ups device.serial "test 1"
VAR ups device.type "ups"
VAR ups driver.debug "0"
VAR ups driver.flag.allow_killpower "0"
VAR ups driver.name "usbhid-ups"
VAR ups driver.parameter.pollfreq "30"
VAR ups driver.parameter.pollinterval "2"
VAR ups driver.parameter.port "auto"
VAR ups driver.parameter.synchronous "auto"
VAR ups driver.state "quiet"
VAR ups driver.version "2.8.1"
VAR ups driver.version.data "CyberPower HID 0.8"
VAR ups driver.version.internal "0.52"
VAR ups driver.version.usb "libusb-1.0.26 (API: 0x1000109)"
VAR ups input.voltage "122.0"
VAR ups input.voltage.nominal "120"
VAR ups output.voltage "122.0"
VAR ups ups.beeper.status "enabled"
VAR ups ups.delay.shutdown "20"
VAR ups ups.delay.start "30"
VAR ups ups.load "3"
VAR ups ups.mfr "CPS"
VAR ups ups.model "LX1325GU"
VAR ups ups.productid "0501"
VAR ups ups.realpower.nominal "810"
VAR ups ups.serial "test 1"
VAR ups ups.status "OL"
VAR ups ups.test.result "No test initiated"
VAR ups ups.timer.shutdown "-60"
VAR ups ups.timer.start "-60"
VAR ups ups.vendorid "0764"
END LIST VAR ups`

describe('Nut', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
  })

  afterEach(async () => {
    // Clean up any Nut instances that might have been created
    // This is a safety measure in case any tests don't properly clean up
    jest.restoreAllMocks()
  })

  it('should get devices', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST UPS\nUPS ups "cyberpower"\nUPS ups2 "cyberpower"\nEND LIST UPS')
    const devices = await nut.getDevices()
    expect(devices.map((device) => device.name)).toEqual(['ups', 'ups2'])
  })

  it('should get variable description', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('DESC ups battery.charge "Battery charge level"')

    const description = await nut.getVarDescription('ups', 'battery.charge')
    expect(description).toEqual('Battery charge level')
  })

  it('should get devices', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST UPS\nUPS ups "cyberpower"\nUPS ups2 "cyberpower"\nEND LIST UPS')

    const devices = await nut.getDevices()
    expect(devices.map((device) => device.name)).toEqual(['ups', 'ups2'])
  })

  it('should detect when a device is unreachable', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue(upsStatus.DEVICE_UNREACHABLE)
    jest.spyOn(Nut.prototype, 'getType').mockResolvedValue('STRING')
    jest.spyOn(Nut.prototype, 'getVarDescription').mockResolvedValue('test')

    const data = await nut.getData('this_ups_cant be reached')
    expect(data['ups.status'].value).toEqual(upsStatus.DEVICE_UNREACHABLE)
  })

  it('should work with multiple ups devices on the same server', async () => {
    const nut = new Nut('localhost', 3493, 'test', 'test')
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue(listVarUps)
    jest.spyOn(Nut.prototype, 'getType').mockResolvedValue('STRING')
    jest.spyOn(Nut.prototype, 'getVarDescription').mockResolvedValue('test')

    const data = await nut.getData('ups')
    expect(data['battery.charge'].value).toEqual('100')
  })

  it('should get device description', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('UPS ups "cyberpower"')

    const description = await nut.getDescription('ups')
    expect(description).toEqual('cyberpower')
  })

  it('should get commands for a device', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST CMD ups\nCMD ups test\nEND LIST CMD ups')

    const commands = await nut.getCommands('ups')
    expect(commands).toEqual(['test'])
  })

  it('should get clients for a device', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST CLIENT ups\nCLIENT ups client1\nEND LIST CLIENT ups')

    const clients = await nut.getClients('ups')
    expect(clients).toEqual(['client1'])
  })

  it('should get read-write variables for a device', async () => {
    const nut = new Nut('localhost', 3493, 'test', 'test')
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST RW ups\nRW ups battery.charge.low "10"\nEND LIST RW ups')

    const rwVars = await nut.getRWVars('ups')
    expect(rwVars).toEqual(['battery.charge.low'])
  })

  it('should get command description', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('CMDDESC ups "test command"')

    const description = await nut.getCommandDescription('test', 'ups')
    expect(description).toEqual('test command')
  })

  it('should get variable value', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('VAR ups battery.charge "100"')

    const value = await nut.getVar('battery.charge', 'ups')
    expect(value).toEqual('100')
  })

  it('should get enum values for a variable', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue(
        'BEGIN LIST ENUM ups battery.charge\nENUM ups battery.charge "100"\nEND LIST ENUM ups battery.charge'
      )

    const enums = await nut.getEnum('battery.charge', 'ups')
    expect(enums).toEqual(['100'])
  })

  it('should get range values for a variable', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue(
        'BEGIN LIST RANGE ups battery.charge\nRANGE ups battery.charge "0-100"\nEND LIST RANGE ups battery.charge'
      )

    const ranges = await nut.getRange('battery.charge', 'ups')
    expect(ranges).toEqual(['0-100'])
  })

  it('should set variable value', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('OK\n')
    jest.spyOn(Nut.prototype, 'deviceExists').mockResolvedValue(true)
    jest
      .spyOn(Nut.prototype, 'getDevices')
      .mockResolvedValue([{ name: 'ups', description: 'test', rwVars: [], commands: [], clients: [], vars: {} }])
    await nut.setVar('battery.charge', '90', 'ups')
    expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('SET VAR ups battery.charge 90')
  })

  describe('checkCredentials', () => {
    it('should successfully check credentials with username and password', async () => {
      const nut = new Nut('localhost', 3493, 'testuser', 'testpass')
      jest
        .spyOn(PromiseSocket.prototype, 'readAll')
        .mockResolvedValueOnce('OK\n') // USERNAME response
        .mockResolvedValueOnce('OK\n') // PASSWORD response
        .mockResolvedValueOnce('OK\n') // LOGIN response
      jest
        .spyOn(Nut.prototype, 'getDevices')
        .mockResolvedValue([{ name: 'ups', description: 'test', rwVars: [], commands: [], clients: [], vars: {} }])
      await nut.checkCredentials()
      expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('USERNAME testuser')
      expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('PASSWORD testpass')
      expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('LOGIN ups')
      expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('LOGOUT')
      expect(PromiseSocket.prototype.close).toHaveBeenCalled()
    })

    it('should successfully check credentials without username and password', async () => {
      const nut = new Nut('localhost', 3493)
      jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValueOnce('OK\n') // LOGIN response
      jest
        .spyOn(Nut.prototype, 'getDevices')
        .mockResolvedValue([{ name: 'ups', description: 'test', rwVars: [], commands: [], clients: [], vars: {} }])
      await nut.checkCredentials()
      expect(PromiseSocket.prototype.write).not.toHaveBeenCalledWith('USERNAME testuser')
      expect(PromiseSocket.prototype.write).not.toHaveBeenCalledWith('PASSWORD testpass')
      expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('LOGIN ups')
      expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('LOGOUT')
      expect(PromiseSocket.prototype.close).toHaveBeenCalled()
    })

    it('should throw error for invalid username', async () => {
      const nut = new Nut('localhost', 3493, 'testuser', 'testpass')
      jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValueOnce('ERR\n') // USERNAME response
      await expect(nut.checkCredentials()).rejects.toThrow('Invalid username')
    })

    it('should throw error for invalid password', async () => {
      const nut = new Nut('localhost', 3493, 'testuser', 'testpass')
      jest
        .spyOn(PromiseSocket.prototype, 'readAll')
        .mockResolvedValueOnce('OK\n') // USERNAME response
        .mockResolvedValueOnce('ERR\n') // PASSWORD response
      await expect(nut.checkCredentials()).rejects.toThrow('Invalid password')
    })

    it('should throw error when no devices found', async () => {
      const nut = new Nut('localhost', 3493, 'testuser', 'testpass')
      jest
        .spyOn(PromiseSocket.prototype, 'readAll')
        .mockResolvedValueOnce('OK\n') // USERNAME response
        .mockResolvedValueOnce('OK\n') // PASSWORD response
      jest.spyOn(Nut.prototype, 'getDevices').mockResolvedValue([])
      await expect(nut.checkCredentials()).rejects.toThrow('No devices found')
    })

    it('should throw error for invalid login credentials', async () => {
      const nut = new Nut('localhost', 3493, 'testuser', 'testpass')
      jest
        .spyOn(PromiseSocket.prototype, 'readAll')
        .mockResolvedValueOnce('OK\n') // USERNAME response
        .mockResolvedValueOnce('OK\n') // PASSWORD response
        .mockResolvedValueOnce('ERR\n') // LOGIN response
      jest
        .spyOn(Nut.prototype, 'getDevices')
        .mockResolvedValue([{ name: 'ups', description: 'test', rwVars: [], commands: [], clients: [], vars: {} }])
      await expect(nut.checkCredentials()).rejects.toThrow('Invalid credentials')
    })

    it('should not close connection when socket is provided', async () => {
      const nut = new Nut('localhost', 3493, 'testuser', 'testpass')
      const mockSocket = {
        write: jest.fn().mockResolvedValue(undefined),
        readAll: jest
          .fn()
          .mockResolvedValueOnce('OK\n') // USERNAME response
          .mockResolvedValueOnce('OK\n') // PASSWORD response
          .mockResolvedValueOnce('OK\n'), // LOGIN response
        close: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(Nut.prototype, 'getDevices')
        .mockResolvedValue([{ name: 'ups', description: 'test', rwVars: [], commands: [], clients: [], vars: {} }])
      await nut.checkCredentials(mockSocket as any)
      expect(mockSocket.write).toHaveBeenCalledWith('USERNAME testuser')
      expect(mockSocket.write).toHaveBeenCalledWith('PASSWORD testpass')
      expect(mockSocket.write).toHaveBeenCalledWith('LOGIN ups')
      expect(mockSocket.write).not.toHaveBeenCalledWith('LOGOUT')
      expect(mockSocket.close).not.toHaveBeenCalled()
    })
  })

  describe('getVersion', () => {
    it('should get version successfully', async () => {
      const nut = new Nut('localhost', 3493)
      jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('2.8.1\n')
      const version = await nut.getVersion()
      expect(version).toEqual('2.8.1')
      expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('VER')
    })
    it('should handle version with extra whitespace', async () => {
      const nut = new Nut('localhost', 3493)
      jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('  2.8.1  \n')
      const version = await nut.getVersion()
      expect(version).toEqual('  2.8.1  ')
    })
    it('should throw error for invalid version response', async () => {
      const nut = new Nut('localhost', 3493)
      jest.spyOn(PromiseSocket.prototype, 'readAll').mockRejectedValue(new Error('ERR Invalid command\n'))
      await expect(nut.getVersion()).rejects.toThrow('ERR Invalid command\n')
    })
  })

  describe('getNetVersion', () => {
    it('should get network version successfully', async () => {
      const nut = new Nut('localhost', 3493)
      jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('1.0\n')
      const netVersion = await nut.getNetVersion()
      expect(netVersion).toEqual('1.0')
      expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('NETVER')
    })
    it('should handle network version with extra whitespace', async () => {
      const nut = new Nut('localhost', 3493)
      jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('  1.0  \n')
      const netVersion = await nut.getNetVersion()
      expect(netVersion).toEqual('  1.0  ')
    })
    it('should throw error for invalid network version response', async () => {
      const nut = new Nut('localhost', 3493)
      jest.spyOn(PromiseSocket.prototype, 'readAll').mockRejectedValue(new Error('ERR Invalid command\n'))
      await expect(nut.getNetVersion()).rejects.toThrow('ERR Invalid command\n')
    })
  })

  describe('getter methods', () => {
    it('should get host', () => {
      const nut = new Nut('testhost', 3493)
      expect(nut.getHost()).toEqual('testhost')
    })

    it('should get port', () => {
      const nut = new Nut('localhost', 1234)
      expect(nut.getPort()).toEqual(1234)
    })

    it('should return true when credentials are provided', () => {
      const nut = new Nut('localhost', 3493, 'username', 'password')
      expect(nut.hasCredentials()).toBe(true)
    })

    it('should return false when no credentials are provided', () => {
      const nut = new Nut('localhost', 3493)
      expect(nut.hasCredentials()).toBe(false)
    })

    it('should return false when only username is provided', () => {
      const nut = new Nut('localhost', 3493, 'username')
      expect(nut.hasCredentials()).toBe(false)
    })

    it('should return false when only password is provided', () => {
      const nut = new Nut('localhost', 3493, undefined, 'password')
      expect(nut.hasCredentials()).toBe(false)
    })

    it('should return false when empty strings are provided', () => {
      const nut = new Nut('localhost', 3493, '', '')
      expect(nut.hasCredentials()).toBe(false)
    })
  })

  describe('deviceExists', () => {
    const createNutWithMockDevices = (
      devices: Array<{
        name: string
        description: string
        rwVars: string[]
        commands: string[]
        clients: string[]
        vars: Record<string, any>
      }>
    ) => {
      const nut = new Nut('localhost', 3493)
      jest.spyOn(Nut.prototype, 'getDevices').mockResolvedValue(devices)
      return nut
    }

    it('should return true when device exists', async () => {
      const nut = createNutWithMockDevices([
        { name: 'ups1', description: 'test1', rwVars: [], commands: [], clients: [], vars: {} },
        { name: 'ups2', description: 'test2', rwVars: [], commands: [], clients: [], vars: {} },
      ])

      const exists = await nut.deviceExists('ups1')
      expect(exists).toBe(true)
    })

    it('should return false when device does not exist', async () => {
      const nut = createNutWithMockDevices([
        { name: 'ups1', description: 'test1', rwVars: [], commands: [], clients: [], vars: {} },
        { name: 'ups2', description: 'test2', rwVars: [], commands: [], clients: [], vars: {} },
      ])

      const exists = await nut.deviceExists('nonexistent')
      expect(exists).toBe(false)
    })

    it('should return false when no devices are available', async () => {
      const nut = createNutWithMockDevices([])

      const exists = await nut.deviceExists('anydevice')
      expect(exists).toBe(false)
    })

    it('should be case sensitive', async () => {
      const nut = createNutWithMockDevices([
        { name: 'UPS1', description: 'test1', rwVars: [], commands: [], clients: [], vars: {} },
      ])

      const exists = await nut.deviceExists('ups1')
      expect(exists).toBe(false)
    })

    it('should handle exact match', async () => {
      const nut = createNutWithMockDevices([
        { name: 'ups1', description: 'test1', rwVars: [], commands: [], clients: [], vars: {} },
      ])

      const exists = await nut.deviceExists('ups1')
      expect(exists).toBe(true)
    })

    it('should handle partial matches correctly', async () => {
      const nut = createNutWithMockDevices([
        { name: 'ups1', description: 'test1', rwVars: [], commands: [], clients: [], vars: {} },
        { name: 'ups1-backup', description: 'test2', rwVars: [], commands: [], clients: [], vars: {} },
      ])

      const exists = await nut.deviceExists('ups1')
      expect(exists).toBe(true)
    })
  })
})
