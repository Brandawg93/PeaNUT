import { Nut } from '@/server/nut'

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
  it('should get devices', async () => {
    const nut = new Nut('localhost', 3493)
    const mockSocket = jest.spyOn(nut as any, 'getCommand')
    mockSocket.mockImplementation(() => {
      return Promise.resolve('BEGIN LIST UPS\nUPS ups "cyberpower"\nUPS ups2 "cyberpower"\nEND LIST UPS')
    })

    // await nut.connect()
    const devices = await nut.getDevices()
    expect(devices.map((device) => device.name)).toEqual(['ups', 'ups2'])
    await nut.close()
  })

  it('should work with multiple ups devices on the same server', async () => {
    const nut = new Nut('localhost', 3493)
    const mockSocket = jest.spyOn(nut as any, 'getCommand')
    mockSocket.mockImplementation(() => {
      return Promise.resolve(listVarUps)
    })

    // await nut.connect()
    const data = await nut.getData('ups')
    expect(data['battery.charge']).toEqual('100')
    await nut.close()
  })
})
