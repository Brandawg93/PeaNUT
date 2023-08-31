import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import { Nut } from './nut';

// Construct a schema, using GraphQL schema language
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ups: {
        type: new GraphQLObjectType({
          name: 'Ups',
          fields: {
            battery_charge: { type: GraphQLString },
            battery_charge_low: { type: GraphQLString },
            battery_charge_warning: { type: GraphQLString },
            battery_mfr_date: { type: GraphQLString },
            battery_runtime: { type: GraphQLString },
            battery_runtime_low: { type: GraphQLString },
            battery_type: { type: GraphQLString },
            battery_voltage: { type: GraphQLString },
            battery_voltage_nominal: { type: GraphQLString },
            device_mfr: { type: GraphQLString },
            device_model: { type: GraphQLString },
            device_serial: { type: GraphQLString },
            device_type: { type: GraphQLString },
            driver_name: { type: GraphQLString },
            driver_parameter_pollfreq: { type: GraphQLString },
            driver_parameter_pollinterval: { type: GraphQLString },
            driver_parameter_port: { type: GraphQLString },
            driver_parameter_synchronous: { type: GraphQLString },
            driver_version: { type: GraphQLString },
            driver_version_data: { type: GraphQLString },
            driver_version_internal: { type: GraphQLString },
            driver_version_usb: { type: GraphQLString },
            input_voltage: { type: GraphQLString },
            input_voltage_nominal: { type: GraphQLString },
            output_voltage: { type: GraphQLString },
            ups_beeper_status: { type: GraphQLString },
            ups_delay_shutdown: { type: GraphQLString },
            ups_delay_start: { type: GraphQLString },
            ups_load: { type: GraphQLString },
            ups_mfr: { type: GraphQLString },
            ups_model: { type: GraphQLString },
            ups_productid: { type: GraphQLString },
            ups_realpower_nominal: { type: GraphQLString },
            ups_serial: { type: GraphQLString },
            ups_status: { type: GraphQLString },
            ups_test_result: { type: GraphQLString },
            ups_timer_shutdown: { type: GraphQLString },
            ups_timer_start: { type: GraphQLString },
            ups_vendorid: { type: GraphQLString },
          },
        }),
        resolve: async () => {
          const nut = new Nut(process.env.NUT_HOST || 'localhost', parseInt(process.env.NUT_PORT || '3493'));
          return await nut.getData();
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
