import { buildSchema } from 'graphql';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    ups: Ups
  }
  type Ups {
    battery_charge: String
    battery_charge_low: String
    battery_charge_warning: String
    battery_mfr_date: String
    battery_runtime: String
    battery_runtime_low: String
    battery_type: String
    battery_voltage: String
    battery_voltage_nominal: String
    device_mfr: String
    device_model: String
    device_serial: String
    device_type: String
    driver_name: String
    driver_parameter_pollfreq: String
    driver_parameter_pollinterval: String
    driver_parameter_port: String
    driver_parameter_synchronous: String
    driver_version: String
    driver_version_data: String
    driver_version_internal: String
    driver_version_usb: String
    input_voltage: String
    input_voltage_nominal: String
    output_voltage: String
    ups_beeper_status: String
    ups_delay_shutdown: String
    ups_delay_start: String
    ups_load: String
    ups_mfr: String
    ups_model: String
    ups_productid: String
    ups_realpower_nominal: String
    ups_serial: String
    ups_status: String
    ups_test_result: String
    ups_timer_shutdown: String
    ups_timer_start: String
    ups_vendorid: String
  }
`);

export default schema;
