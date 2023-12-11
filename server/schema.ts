import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { Nut } from './nut';

const ups = new GraphQLObjectType({
  name: 'Ups',
  fields: {
    battery_charge: { type: GraphQLString, description: 'Battery charge (percent of full)' },
    battery_charge_low: {
      type: GraphQLString,
      description: 'Remaining battery level when UPS switches to LB (percent)',
    },
    battery_charge_warning: {
      type: GraphQLString,
      description: 'Battery level when UPS switches to Warning state (percent)',
    },
    battery_mfr_date: { type: GraphQLString, description: 'Battery manufacturing date' },
    battery_runtime: { type: GraphQLString, description: 'Battery runtime (seconds)' },
    battery_runtime_low: {
      type: GraphQLString,
      description: 'Remaining battery runtime when UPS switches to LB (seconds)',
    },
    battery_type: { type: GraphQLString, description: 'Battery chemistry' },
    battery_voltage: { type: GraphQLString, description: 'Battery voltage (V)' },
    battery_voltage_nominal: { type: GraphQLString, description: 'Nominal battery voltage (V)' },
    device_mfr: { type: GraphQLString, description: 'UPS manufacturer' },
    device_model: { type: GraphQLString, description: 'UPS model' },
    device_serial: { type: GraphQLString, description: 'UPS serial number' },
    device_type: { type: GraphQLString, description: 'UPS type' },
    driver_name: { type: GraphQLString, description: 'Driver name' },
    driver_parameter_pollfreq: { type: GraphQLString },
    driver_parameter_pollinterval: { type: GraphQLString },
    driver_parameter_port: { type: GraphQLString },
    driver_parameter_synchronous: { type: GraphQLString },
    driver_version: { type: GraphQLString, description: 'Driver version - NUT release' },
    driver_version_data: { type: GraphQLString },
    driver_version_internal: { type: GraphQLString, description: 'Internal driver version' },
    driver_version_usb: { type: GraphQLString, description: 'USB library version' },
    input_voltage: { type: GraphQLString, description: 'Input voltage (V)' },
    input_voltage_nominal: { type: GraphQLString, description: 'Nominal input voltage (V)' },
    output_voltage: { type: GraphQLString, description: 'Output voltage (V)' },
    ups_beeper_status: { type: GraphQLString, description: 'UPS beeper status' },
    ups_delay_shutdown: {
      type: GraphQLString,
      description: 'Interval to wait after shutdown with delay command (seconds)',
    },
    ups_delay_start: { type: GraphQLString, description: 'Time before the load will be started (seconds)' },
    ups_load: { type: GraphQLString, description: 'Load on UPS (percent of full)' },
    ups_mfr: { type: GraphQLString, description: 'UPS manufacturer' },
    ups_model: { type: GraphQLString, description: 'UPS model' },
    ups_productid: { type: GraphQLString, description: 'Product ID for USB devices' },
    ups_realpower: { type: GraphQLString, description: 'UPS real power rating (W)' },
    ups_realpower_nominal: { type: GraphQLString, description: 'UPS nominal real power rating (W)' },
    ups_serial: { type: GraphQLString, description: 'UPS serial number' },
    ups_status: { type: GraphQLString, description: 'UPS status' },
    ups_test_result: { type: GraphQLString, description: 'Results of last self test' },
    ups_timer_shutdown: { type: GraphQLString, description: 'Time before the load will be shutdown (seconds)' },
    ups_timer_start: { type: GraphQLString, description: 'Time before the load will be started (seconds)' },
    ups_vendorid: { type: GraphQLString, description: 'Vendor ID for USB devices' },
  },
});

// Construct a schema, using GraphQL schema language
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      devices: {
        type: new GraphQLList(ups),
        resolve: async () => {
          const nut = new Nut(
            process.env.NUT_HOST || 'localhost',
            parseInt(process.env.NUT_PORT || '3493'),
            process.env.USERNAME,
            process.env.PASSWORD,
          );
          await nut.connect();
          const devices = await nut.getDevices();
          const promises = [];
          for (const device of devices) {
            const promise = nut.getData(device);
            promises.push(promise);
          }
          const data = await Promise.all(promises);
          await nut.close();
          return data;
        },
      },
      updated: {
        type: GraphQLInt,
        resolve: () => {
          return Math.floor(Date.now() / 1000);
        },
      },
    },
  }),
});

export default schema;
