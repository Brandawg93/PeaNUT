import { render } from '@testing-library/react'
import LineChart from '@/client/components/line-chart'
import { DEVICE } from '@/common/types'

jest.mock('react-chartjs-2', () => ({
  Line: () => null,
}))

const devices: DEVICE = {
  'battery.charge': 100,
  'battery.charge.low': 10,
  'battery.charge.warning': 20,
  'battery.mfr.date': 'CPS',
  'battery.runtime': 25230,
  'battery.runtime.low': 300,
  'battery.type': 'PbAcid',
  'battery.voltage': 24.0,
  'battery.voltage.nominal': 24,
  'device.mfr': 'CPS',
  'device.model': 'LX1325GU',
  'device.serial': 'test1',
  'device.type': 'ups',
  'driver.debug': 0,
  'driver.flag.allow_killpower': 0,
  'driver.name': 'usbhid-ups',
  'driver.parameter.pollfreq': 30,
  'driver.parameter.pollinterval': 2,
  'driver.parameter.port': 'auto',
  'driver.parameter.synchronous': 'auto',
  'driver.state': 'quiet',
  'driver.version': '2.8.1',
  'driver.version.data': 'CyberPower HID 0.8',
  'driver.version.internal': '0.52',
  'driver.version.usb': 'libusb-1.0.26 (API: 0x1000109)',
  'input.voltage': 123.0,
  'input.voltage.nominal': 120,
  'output.voltage': 123.0,
  'ups.beeper.status': 'enabled',
  'ups.delay.shutdown': 20,
  'ups.delay.start': 30,
  'ups.load': 3,
  'ups.mfr': 'CPS',
  'ups.model': 'LX1325GU',
  'ups.productid': '0501',
  'ups.realpower': 810,
  'ups.realpower.nominal': 810,
  'ups.serial': 'test1',
  'ups.status': 'OL',
  'ups.test.result': 'No test initiated',
  'ups.timer.shutdown': '-60',
  'ups.timer.start': '-60',
  'ups.vendorid': '0764',
}

describe('Line', () => {
  it('renders', () => {
    const { getByTestId } = render(<LineChart data={devices} />)

    expect(getByTestId('line')).toBeInTheDocument()
  })
})
