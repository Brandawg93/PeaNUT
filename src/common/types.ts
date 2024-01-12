import { upsStatus } from '@/common/constants'

export type DEVICE_LIST = {
  name: string
  description: string
}

export type DEVICE = {
  [x: string]: string | number // catch arbitrary keys
  'battery.charge': number // battery charge (percent of full)
  'battery.charge.low': number // Remaining battery level when UPS switches to LB (percent)
  'battery.charge.warning': number // battery level when UPS switches to Warning state (percent)
  'battery.mfr.date': string // battery manufacturing date
  'battery.runtime': number // battery runtime (seconds)
  'battery.runtime.low': number // Remaining battery runtime when UPS switches to LB (seconds)
  'battery.type': string // battery chemistry
  'battery.voltage': number // battery voltage (V)
  'battery.voltage.nominal': number // Nominal battery voltage (V)
  'device.mfr': string // UPS manufacturer
  'device.model': string // UPS model
  'device.serial': string // UPS serial number
  'device.type': string // UPS type
  'driver.name': string // driver name
  'driver.debug': number // driver debug level
  'driver.flag.allow_killpower': number // Allow killpower
  'driver.parameter.pollfreq': number
  'driver.parameter.pollinterval': number
  'driver.parameter.port': string
  'driver.parameter.synchronous': string
  'driver.version': string // driver version - NUT release
  'driver.version.data': string
  'driver.version.internal': string // Internal driver version
  'driver.version.usb': string // USB library version
  'input.voltage': number // Input voltage (V)
  'input.voltage.nominal': number // Nominal input voltage (V)
  'output.voltage': number // Output voltage (V)
  'ups.beeper.status': string // UPS beeper status
  'ups.delay.shutdown': number // Interval to wait after shutdown with delay command (seconds)
  'ups.delay.start': number // Time before the load will be started (seconds)
  'ups.load': number // Load on UPS (percent of full)
  'ups.mfr': string // UPS manufacturer
  'ups.model': string // UPS model
  'ups.productid': string // Product ID for USB devices
  'ups.realpower': number // UPS real power rating (W)
  'ups.realpower.nominal': number // UPS nominal real power rating (W)
  'ups.serial': string // UPS serial number
  'ups.status': keyof typeof upsStatus // UPS status
  'ups.test.result': string // Results of last self test
  'ups.timer.shutdown': string // Time before the load will be shutdown (seconds)
  'ups.timer.start': string // Time before the load will be started (seconds)
  'ups.vendorid': string // Vendor ID for USB devices
}
