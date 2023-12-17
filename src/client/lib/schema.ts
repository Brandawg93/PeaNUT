import { gql, TypedDocumentNode } from '@apollo/client'

import { QUERY_DATA } from '@/common/graphql'

export const query: TypedDocumentNode<QUERY_DATA> = gql`
  query {
    devices {
      battery_charge
      battery_charge_low
      battery_charge_warning
      battery_mfr_date
      battery_runtime
      battery_runtime_low
      battery_type
      battery_voltage
      battery_voltage_nominal
      device_mfr
      device_model
      device_serial
      device_type
      driver_name
      driver_parameter_pollfreq
      driver_parameter_pollinterval
      driver_parameter_port
      driver_parameter_synchronous
      driver_version
      driver_version_data
      driver_version_internal
      driver_version_usb
      input_voltage
      input_voltage_nominal
      output_voltage
      ups_beeper_status
      ups_delay_shutdown
      ups_delay_start
      ups_load
      ups_mfr
      ups_model
      ups_productid
      ups_realpower
      ups_realpower_nominal
      ups_serial
      ups_status
      ups_test_result
      ups_timer_shutdown
      ups_timer_start
      ups_vendorid
    }
    updated
  }
`
