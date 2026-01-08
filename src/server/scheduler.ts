import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'
import chokidar from 'chokidar'
import { YamlSettings } from '@/server/settings'
import { getDevices } from '@/app/actions'
import InfluxWriter from '@/server/influxdb'
import { DEFAULT_INFLUX_INTERVAL } from '@/common/constants'
import { createDebugLogger } from '@/server/debug'

const settingsFile = process.env.SETTINGS_FILE || './config/settings.yml'
const debug = createDebugLogger('SCHEDULER')

// Initialize settings and scheduler
const settings = new YamlSettings(settingsFile)
const scheduler = new ToadScheduler()

// Get the current interval from settings or default to DEFAULT_INFLUX_INTERVAL seconds
const influxInterval = settings.get('INFLUX_INTERVAL') || DEFAULT_INFLUX_INTERVAL

debug.info('Scheduler initialized', { influxInterval })

// Define the task to write data to InfluxDB
const createTask = () =>
  new Task('influx writer', () => {
    debug.info('Starting InfluxDB write task')
    const taskSettings = new YamlSettings(settingsFile)
    const influxHost = taskSettings.get('INFLUX_HOST')
    const influxToken = taskSettings.get('INFLUX_TOKEN')
    const influxOrg = taskSettings.get('INFLUX_ORG')
    const influxBucket = taskSettings.get('INFLUX_BUCKET')

    debug.debug('InfluxDB configuration', {
      hasHost: !!influxHost,
      hasToken: !!influxToken,
      hasOrg: !!influxOrg,
      hasBucket: !!influxBucket,
    })

    // Check if all required InfluxDB settings are available
    if (influxHost && influxToken && influxOrg && influxBucket) {
      getDevices()
        .then(({ devices }) => {
          debug.info('Retrieved devices for InfluxDB write', { deviceCount: devices?.length || 0 })
          const influxdata = new InfluxWriter(influxHost, influxToken, influxOrg, influxBucket)
          const writePromises = (devices ?? []).map((device) => influxdata.writePoint(device, new Date()))
          return Promise.all(writePromises)
            .then(() => {
              debug.info('Successfully wrote all devices to InfluxDB')
              return influxdata.close()
            })
            .catch((error) => {
              debug.error('Error writing to InfluxDB', {
                error: error instanceof Error ? error.message : String(error),
              })
              console.error('Error writing to InfluxDB:', error)
            })
        })
        .catch((error) => {
          debug.error('Error getting devices for InfluxDB write', {
            error: error instanceof Error ? error.message : String(error),
          })
          console.error('Error getting devices:', error)
        })
    } else {
      debug.warn('InfluxDB configuration incomplete, skipping write task')
    }
  })

const addOrUpdateJob = (interval: number) => {
  debug.info('Adding or updating scheduler job', { interval })
  if (scheduler.existsById('id_1')) {
    debug.debug('Removing existing job before adding new one')
    scheduler.removeById('id_1')
  }
  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob({ seconds: interval, runImmediately: true }, createTask(), {
      id: 'id_1',
      preventOverrun: true,
    })
  )
  debug.info('Scheduler job added successfully')
}

addOrUpdateJob(influxInterval)

// Define the task to check and update the interval
const watcher = chokidar.watch(settingsFile)

watcher.on('change', () => {
  debug.info('Settings file changed, updating scheduler configuration')
  const newSettings = new YamlSettings(settingsFile)
  const newInfluxHost = newSettings.get('INFLUX_HOST')
  const newInfluxToken = newSettings.get('INFLUX_TOKEN')
  const newInfluxOrg = newSettings.get('INFLUX_ORG')
  const newInfluxBucket = newSettings.get('INFLUX_BUCKET')
  const newInterval = newSettings.get('INFLUX_INTERVAL') || DEFAULT_INFLUX_INTERVAL

  debug.debug('New InfluxDB configuration', {
    hasHost: !!newInfluxHost,
    hasToken: !!newInfluxToken,
    hasOrg: !!newInfluxOrg,
    hasBucket: !!newInfluxBucket,
    newInterval,
  })

  if (newInfluxHost && newInfluxToken && newInfluxOrg && newInfluxBucket) {
    addOrUpdateJob(newInterval)
  } else {
    debug.warn('Incomplete InfluxDB configuration, skipping scheduler update')
  }
})
