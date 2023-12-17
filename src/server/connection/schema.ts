import { gql } from '@apollo/client'

import { Nut } from './nut'

export const typeDefs = gql`
  type Query {
    devices: [Ups]
    updated: Int
  }
  type Ups {
    battery_charge: String # Battery charge (percent of full)
    battery_charge_low: String # Remaining battery level when UPS switches to LB (percent)
    battery_charge_warning: String # Battery level when UPS switches to Warning state (percent)
    battery_mfr_date: String # Battery manufacturing date
    battery_runtime: String # Battery runtime (seconds)
    battery_runtime_low: String # Remaining battery runtime when UPS switches to LB (seconds)
    battery_type: String # Battery chemistry
    battery_voltage: String # Battery voltage (V)
    battery_voltage_nominal: String # Nominal battery voltage (V)
    device_mfr: String # UPS manufacturer
    device_model: String # UPS model
    device_serial: String # UPS serial number
    device_type: String # UPS type
    driver_name: String # Driver name
    driver_parameter_pollfreq: String
    driver_parameter_pollinterval: String
    driver_parameter_port: String
    driver_parameter_synchronous: String
    driver_version: String # Driver version - NUT release
    driver_version_data: String
    driver_version_internal: String # Internal driver version
    driver_version_usb: String # USB library version
    input_voltage: String # Input voltage (V)
    input_voltage_nominal: String # Nominal input voltage (V)
    output_voltage: String # Output voltage (V)
    ups_beeper_status: String # UPS beeper status
    ups_delay_shutdown: String # Interval to wait after shutdown with delay command (seconds)
    ups_delay_start: String # Time before the load will be started (seconds)
    ups_load: String # Load on UPS (percent of full)
    ups_mfr: String # UPS manufacturer
    ups_model: String # UPS model
    ups_productid: String # Product ID for USB devices
    ups_realpower: String # UPS real power rating (W)
    ups_realpower_nominal: String # UPS nominal real power rating (W)
    ups_serial: String # UPS serial number
    ups_status: String # UPS status
    ups_test_result: String # Results of last self test
    ups_timer_shutdown: String # Time before the load will be shutdown (seconds)
    ups_timer_start: String # Time before the load will be started (seconds)
    ups_vendorid: String # Vendor ID for USB devices
  }
`

export const resolvers = {
  Query: {
    devices: async () => {
      const nut = new Nut(
        process.env.NUT_HOST || 'localhost',
        parseInt(process.env.NUT_PORT || '3493', 10),
        process.env.USERNAME,
        process.env.PASSWORD,
      )
      await nut.connect()
      const devices = await nut.getDevices()
      const promises = devices.map((device) => nut.getData(device, '_'))
      const data = await Promise.all(promises)
      await nut.close()
      return data
    },
    updated: () => Math.floor(Date.now() / 1000),
  },
}
