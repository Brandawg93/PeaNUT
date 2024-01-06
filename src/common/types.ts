import { upsStatus } from './constants'

export type DEVICE_LIST = {
  name: string
  description: string
}

export type VAR = {
  name: string
  value: string
  type: string
  enum: Array<string>
  range: Array<string>
}

export type VARS = {
  [x: string]: string // catch arbitrary keys
  'battery.charge': string // 'battery charge (percent of full)
  'battery.charge.low': string // Remaining 'battery level when UPS switches to LB (percent)
  'battery.charge.warning': string // 'battery level when UPS switches to Warning state (percent)
  'battery.mfr.date': string // 'battery manufacturing date
  'battery.runtime': string // 'battery runtime (seconds)
  'battery.runtime.low': string // Remaining 'battery runtime when UPS switches to LB (seconds)
  'battery.type': string // 'battery chemistry
  'battery.voltage': string // 'battery voltage (V)
  'battery.voltage.nominal': string // Nominal 'battery voltage (V)
  'device.mfr': string // UPS manufacturer
  'device.model': string // UPS model
  'device.serial': string // UPS serial number
  'device.type': string // UPS type
  'driver.name': string // 'driver name
  'driver.parameter.pollfreq': string
  'driver.parameter.pollinterval': string
  'driver.parameter.port': string
  'driver.parameter.synchronous': string
  'driver.version': string // 'driver version - NUT release
  'driver.version.data': string
  'driver.version.internal': string // Internal 'driver version
  'driver.version.usb': string // USB library version
  'input.voltage': string // Input voltage (V)
  'input.voltage.nominal': string // Nominal input voltage (V)
  'output.voltage': string // Output voltage (V)
  'ups.beeper.status': string // UPS beeper status
  'ups.delay.shutdown': string // Interval to wait after shutdown with delay command (seconds)
  'ups.delay.start': string // Time before the load will be started (seconds)
  'ups.load': string // Load on UPS (percent of full)
  'ups.mfr': string // UPS manufacturer
  'ups.model': string // UPS model
  'ups.productid': string // Product ID for USB 'devices
  'ups.realpower': string // UPS real power rating (W)
  'ups.realpower.nominal': string // UPS nominal real power rating (W)
  'ups.serial': string // UPS serial number
  'ups.status': keyof typeof upsStatus // UPS status
  'ups.test.result': string // Results of last self test
  'ups.timer.shutdown': string // Time before the load will be shutdown (seconds)
  'ups.timer.start': string // Time before the load will be started (seconds)
  'ups.vendorid': string // Vendor ID for USB 'devices
}

export type DEVICE = {
  vars: VARS
  rwVars: Array<keyof VARS>
  description: string
  commands: Array<string>
  clients: Array<string>
}