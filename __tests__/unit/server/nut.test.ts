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
  beforeAll(() => {
    jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
    jest.spyOn(Nut.prototype, 'checkCredentials').mockResolvedValue()
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

    await nut.setVar('battery.charge', '90', 'ups')
    expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('SET VAR ups battery.charge 90')
  })
})
