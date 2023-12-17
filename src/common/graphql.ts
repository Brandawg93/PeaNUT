import { upsStatus } from './constants'

export interface DEVICE {
  battery_charge: string // Battery charge (percent of full)
  battery_charge_low: string // Remaining battery level when UPS switches to LB (percent)
  battery_charge_warning: string // Battery level when UPS switches to Warning state (percent)
  battery_mfr_date: string // Battery manufacturing date
  battery_runtime: string // Battery runtime (seconds)
  battery_runtime_low: string // Remaining battery runtime when UPS switches to LB (seconds)
  battery_type: string // Battery chemistry
  battery_voltage: string // Battery voltage (V)
  battery_voltage_nominal: string // Nominal battery voltage (V)
  device_mfr: string // UPS manufacturer
  device_model: string // UPS model
  device_serial: string // UPS serial number
  device_type: string // UPS type
  driver_name: string // Driver name
  driver_parameter_pollfreq: string
  driver_parameter_pollinterval: string
  driver_parameter_port: string
  driver_parameter_synchronous: string
  driver_version: string // Driver version - NUT release
  driver_version_data: string
  driver_version_internal: string // Internal driver version
  driver_version_usb: string // USB library version
  input_voltage: string // Input voltage (V)
  input_voltage_nominal: string // Nominal input voltage (V)
  output_voltage: string // Output voltage (V)
  ups_beeper_status: string // UPS beeper status
  ups_delay_shutdown: string // Interval to wait after shutdown with delay command (seconds)
  ups_delay_start: string // Time before the load will be started (seconds)
  ups_load: string // Load on UPS (percent of full)
  ups_mfr: string // UPS manufacturer
  ups_model: string // UPS model
  ups_productid: string // Product ID for USB devices
  ups_realpower: string // UPS real power rating (W)
  ups_realpower_nominal: string // UPS nominal real power rating (W)
  ups_serial: string // UPS serial number
  ups_status: keyof typeof upsStatus // UPS status
  ups_test_result: string // Results of last self test
  ups_timer_shutdown: string // Time before the load will be shutdown (seconds)
  ups_timer_start: string // Time before the load will be started (seconds)
  ups_vendorid: string // Vendor ID for USB devices
}

export type QUERY_DATA = {
  devices: DEVICE[]
  updated: number
}

export type QUERY_VARIABLES = {}
