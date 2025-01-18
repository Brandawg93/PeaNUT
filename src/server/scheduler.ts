import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'
import chokidar from 'chokidar'
import { YamlSettings } from '@/server/settings'
import { getDevices } from '@/app/actions'
import InfluxWriter from '@/server/influxdb'
import { NotifierFactory } from '@/server/notifications/notifier-factory'
import { Notifier } from '@/server/notifications/notifier'
import { DEVICE } from '@/common/types'

const settingsFile = './config/settings.yml'

// Initialize settings and scheduler
const settings = new YamlSettings(settingsFile)
const scheduler = new ToadScheduler()

// Get the current interval from settings or default to 10 seconds
const influxInterval = settings.get('INFLUX_INTERVAL') || 10
const notificationInterval = settings.get('NOTIFICATION_INTERVAL') || 10

// Define the task to write data to InfluxDB
const createInfluxDbTask = () =>
  new Task('influx writer', () => {
    const taskSettings = new YamlSettings(settingsFile)
    const influxHost = taskSettings.get('INFLUX_HOST')
    const influxToken = taskSettings.get('INFLUX_TOKEN')
    const influxOrg = taskSettings.get('INFLUX_ORG')
    const influxBucket = taskSettings.get('INFLUX_BUCKET')

    // Check if all required InfluxDB settings are available
    if (influxHost && influxToken && influxOrg && influxBucket) {
      getDevices().then(({ devices }) => {
        const influxdata = new InfluxWriter(influxHost, influxToken, influxOrg, influxBucket)
        const writePromises = (devices || []).map((device) => influxdata.writePoint(device, new Date()))
        return Promise.all(writePromises)
          .then(() => influxdata.close())
          .catch((error) => {
            console.error('Error writing to InfluxDB:', error)
          })
      })
    }
  })

let _prevDeviceState: Array<DEVICE> | undefined
const createNotificationTask = () =>
  new Task('notifications', () => {
    const taskSettings = new YamlSettings(settingsFile)
    const notification_providers = taskSettings.get('NOTIFICATION_PROVIDERS')
    const allNotifiers: Array<Notifier> = []
    const allNotificationTasks: Array<Promise<void>> = []
    for (const notifier_settings of notification_providers) {
      const notifier = NotifierFactory(notifier_settings)
      allNotifiers.push(notifier)
    }
    getDevices().then(({ devices }) => {
      if (_prevDeviceState) {
        for (const device of devices || []) {
          const prevDevice = _prevDeviceState.find((d) => d.name === device.name)
          if (!prevDevice) {
            continue
          }
          for (const notifier of allNotifiers) {
            const notifications = notifier.processTriggers(prevDevice, device)
            for (const notification of notifications) {
              allNotificationTasks.push(notifier.send(notification))
            }
          }
        }
        return Promise.all(allNotificationTasks).catch((error) => {
          console.error('Error sending notifications: ', error)
        })
      }
      _prevDeviceState = devices
    })
  })

const addOrUpdateJob = (id: string, interval: number, job: Task) => {
  if (scheduler.existsById(id)) {
    scheduler.removeById(id)
  }
  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob({ seconds: interval, runImmediately: true }, job, {
      id: id,
      preventOverrun: true,
    })
  )
}

addOrUpdateJob('influxdb_job', influxInterval, createInfluxDbTask())
addOrUpdateJob('notifications_job', notificationInterval, createNotificationTask())

// Define the task to check and update the interval
const watcher = chokidar.watch(settingsFile)

watcher.on('change', () => {
  const newSettings = new YamlSettings(settingsFile)
  const newInfluxHost = newSettings.get('INFLUX_HOST')
  const newInfluxToken = newSettings.get('INFLUX_TOKEN')
  const newInfluxOrg = newSettings.get('INFLUX_ORG')
  const newInfluxBucket = newSettings.get('INFLUX_BUCKET')
  const newInterval = newSettings.get('INFLUX_INTERVAL') || 10

  if (newInfluxHost && newInfluxToken && newInfluxOrg && newInfluxBucket) {
    addOrUpdateJob('influxdb_job', newInterval, createInfluxDbTask())
  }

  const newNotificationProviders = newSettings.get('NOTIFICATION_PROVIDERS')
  const newNotificationInterval = newSettings.get('NOTIFICATION_INTERVAL') || 10
  if (newNotificationProviders && newNotificationInterval) {
    addOrUpdateJob('notifications_job', newNotificationInterval, createNotificationTask())
  }
})
