import { Nut } from '@/server/nut'
import PromiseSocket from '@/server/promise-socket'

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
    jest.spyOn(PromiseSocket.prototype, 'close').mockReturnValue()
    jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
  })

  it('should get devices', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST UPS\nUPS ups "cyberpower"\nUPS ups2 "cyberpower"\nEND LIST UPS')
    await nut.connect()
    const devices = await nut.getDevices()
    expect(devices.map((device) => device.name)).toEqual(['ups', 'ups2'])
    await nut.close()
  })

  it('should work with multiple ups devices on the same server', async () => {
    const nut = new Nut('localhost', 3493, 'test', 'test')
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValueOnce('OK\n')
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValueOnce('OK\n')
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue(listVarUps)
    jest.spyOn(Nut.prototype, 'getType').mockResolvedValue('STRING')
    await nut.connect()
    const data = await nut.getData('ups')
    expect(data['battery.charge'].value).toEqual('100')
    await nut.close()
  })

  it('should get devices', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST UPS\nUPS ups "cyberpower"\nUPS ups2 "cyberpower"\nEND LIST UPS')
    await nut.connect()
    const devices = await nut.getDevices()
    expect(devices.map((device) => device.name)).toEqual(['ups', 'ups2'])
    await nut.close()
  })

  it('should work with multiple ups devices on the same server', async () => {
    const nut = new Nut('localhost', 3493, 'test', 'test')
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValueOnce('OK\n')
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValueOnce('OK\n')
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue(listVarUps)
    jest.spyOn(Nut.prototype, 'getType').mockResolvedValue('STRING')
    await nut.connect()
    const data = await nut.getData('ups')
    expect(data['battery.charge'].value).toEqual('100')
    await nut.close()
  })

  it('should get device description', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('UPS ups "cyberpower"')
    await nut.connect()
    const description = await nut.getDescription('ups')
    expect(description).toEqual('cyberpower')
    await nut.close()
  })

  it('should get commands for a device', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST CMD ups\nCMD ups test\nEND LIST CMD ups')
    await nut.connect()
    const commands = await nut.getCommands('ups')
    expect(commands).toEqual(['test'])
    await nut.close()
  })

  it('should get clients for a device', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST CLIENT ups\nCLIENT ups client1\nEND LIST CLIENT ups')
    await nut.connect()
    const clients = await nut.getClients('ups')
    expect(clients).toEqual(['client1'])
    await nut.close()
  })

  it('should get read-write variables for a device', async () => {
    process.env.USERNAME = 'test'
    process.env.PASSWORD = 'test'
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue('BEGIN LIST RW ups\nRW ups battery.charge.low "10"\nEND LIST RW ups')
    await nut.connect()
    const rwVars = await nut.getRWVars('ups')
    expect(rwVars).toEqual(['battery.charge.low'])
    await nut.close()
  })

  it('should get command description', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('CMDDESC ups "test command"')
    await nut.connect()
    const description = await nut.getCommandDescription('ups', 'test')
    expect(description).toEqual('test command')
    await nut.close()
  })

  it('should get variable value', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('VAR ups battery.charge "100"')
    await nut.connect()
    const value = await nut.getVar('ups', 'battery.charge')
    expect(value).toEqual('100')
    await nut.close()
  })

  it('should get variable description', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('DESC ups battery.charge "Battery charge level"')
    await nut.connect()
    const description = await nut.getVarDescription('ups', 'battery.charge')
    expect(description).toEqual('Battery charge level')
    await nut.close()
  })

  it('should get enum values for a variable', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue(
        'BEGIN LIST ENUM ups battery.charge\nENUM ups battery.charge "100"\nEND LIST ENUM ups battery.charge'
      )
    await nut.connect()
    const enums = await nut.getEnum('ups', 'battery.charge')
    expect(enums).toEqual(['100'])
    await nut.close()
  })

  it('should get range values for a variable', async () => {
    const nut = new Nut('localhost', 3493)
    jest
      .spyOn(PromiseSocket.prototype, 'readAll')
      .mockResolvedValue(
        'BEGIN LIST RANGE ups battery.charge\nRANGE ups battery.charge "0-100"\nEND LIST RANGE ups battery.charge'
      )
    await nut.connect()
    const ranges = await nut.getRange('ups', 'battery.charge')
    expect(ranges).toEqual(['0-100'])
    await nut.close()
  })

  it('should set variable value', async () => {
    const nut = new Nut('localhost', 3493)
    jest.spyOn(PromiseSocket.prototype, 'readAll').mockResolvedValue('OK\n')
    await nut.connect()
    await nut.setVar('ups', 'battery.charge', '90')
    expect(PromiseSocket.prototype.write).toHaveBeenCalledWith('SET VAR ups battery.charge 90')
    await nut.close()
  })
})
