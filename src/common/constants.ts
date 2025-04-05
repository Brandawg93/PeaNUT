export const upsStatus = {
  OL: 'Online',
  'OL CHRG': 'Online Charging',
  OB: 'On Battery',
  LB: 'Low Battery',
  HB: 'High Battery',
  RB: 'Battery Needs Replacement',
  CHRG: 'Battery Charging',
  DISCHRG: 'Battery Discharging',
  BYPASS: 'Bypass Active',
  CAL: 'Runtime Calibration',
  OFF: 'Offline',
  OVER: 'Overloaded',
  TRIM: 'Trimming Voltage',
  BOOST: 'Boosting Voltage',
  FSD: 'Forced Shutdown',
  ALARM: 'Alarm',
  DEVICE_UNREACHABLE: 'Device Unreachable',
}

const COMMAND_BEEPER_DISABLE = 'beeper.disable'
const COMMAND_BEEPER_ENABLE = 'beeper.enable'
const COMMAND_BEEPER_MUTE = 'beeper.mute'
const COMMAND_BEEPER_TOGGLE = 'beeper.toggle'
const COMMAND_BYPASS_START = 'bypass.start'
const COMMAND_BYPASS_STOP = 'bypass.stop'
const COMMAND_CALIBRATE_START = 'calibrate.start'
const COMMAND_CALIBRATE_STOP = 'calibrate.stop'
const COMMAND_LOAD_OFF = 'load.off'
const COMMAND_LOAD_ON = 'load.on'
const COMMAND_RESET_INPUT_MINMAX = 'reset.input.minmax'
const COMMAND_RESET_WATCHDOG = 'reset.watchdog'
const COMMAND_SHUTDOWN_REBOOT = 'shutdown.reboot'
const COMMAND_SHUTDOWN_REBOOT_GRACEFUL = 'shutdown.reboot.graceful'
const COMMAND_SHUTDOWN_RETURN = 'shutdown.return'
const COMMAND_SHUTDOWN_STAYOFF = 'shutdown.stayoff'
const COMMAND_SHUTDOWN_STOP = 'shutdown.stop'
const COMMAND_TEST_BATTERY_START = 'test.battery.start'
const COMMAND_TEST_BATTERY_START_DEEP = 'test.battery.start.deep'
const COMMAND_TEST_BATTERY_START_QUICK = 'test.battery.start.quick'
const COMMAND_TEST_BATTERY_STOP = 'test.battery.stop'
const COMMAND_TEST_FAILURE_START = 'test.failure.start'
const COMMAND_TEST_FAILURE_STOP = 'test.failure.stop'
const COMMAND_TEST_PANEL_START = 'test.panel.start'
const COMMAND_TEST_PANEL_STOP = 'test.panel.stop'
const COMMAND_TEST_SYSTEM_START = 'test.system.start'
const COMMAND_DRIVER_RELOAD = 'driver.reload'

export const SUPPORTED_COMMANDS = {
  COMMAND_BEEPER_DISABLE,
  COMMAND_BEEPER_ENABLE,
  COMMAND_BEEPER_MUTE,
  COMMAND_BEEPER_TOGGLE,
  COMMAND_BYPASS_START,
  COMMAND_BYPASS_STOP,
  COMMAND_CALIBRATE_START,
  COMMAND_CALIBRATE_STOP,
  COMMAND_LOAD_OFF,
  COMMAND_LOAD_ON,
  COMMAND_RESET_INPUT_MINMAX,
  COMMAND_RESET_WATCHDOG,
  COMMAND_SHUTDOWN_REBOOT,
  COMMAND_SHUTDOWN_REBOOT_GRACEFUL,
  COMMAND_SHUTDOWN_RETURN,
  COMMAND_SHUTDOWN_STAYOFF,
  COMMAND_SHUTDOWN_STOP,
  COMMAND_TEST_BATTERY_START,
  COMMAND_TEST_BATTERY_START_DEEP,
  COMMAND_TEST_BATTERY_START_QUICK,
  COMMAND_TEST_BATTERY_STOP,
  COMMAND_TEST_FAILURE_START,
  COMMAND_TEST_FAILURE_STOP,
  COMMAND_TEST_PANEL_START,
  COMMAND_TEST_PANEL_STOP,
  COMMAND_TEST_SYSTEM_START,
  COMMAND_DRIVER_RELOAD,
}

export const DEFAULT_INFLUX_INTERVAL = 10

export const DEVICE_UNREACHABLE = 'DEVICE_UNREACHABLE'
