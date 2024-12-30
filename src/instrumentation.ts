'use server'

const settingsFile = './config/settings.yml'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import required modules
    const { YamlSettings } = await import('./server/settings')
    const { getDevices } = await import('./app/actions')
    const InfluxWriter = (await import('./server/influxdb')).default
    const { ToadScheduler, SimpleIntervalJob, Task } = await import('toad-scheduler')
    const fs = await import('fs')

    // Initialize settings and scheduler
    const settings = new YamlSettings(settingsFile)
    const scheduler = new ToadScheduler()

    // Get the current interval from settings or default to 10 seconds
    const influxInterval = settings.get('INFLUX_INTERVAL') || 10

    // Define the task to write data to InfluxDB
    const createTask = () =>
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

    const addOrUpdateJob = (interval: number) => {
      if (scheduler.existsById('id_1')) {
        scheduler.removeById('id_1')
      }
      scheduler.addSimpleIntervalJob(
        new SimpleIntervalJob({ seconds: interval, runImmediately: true }, createTask(), {
          id: 'id_1',
          preventOverrun: true,
        })
      )
    }

    addOrUpdateJob(influxInterval)

    // Define the task to check and update the interval
    fs.watch(settingsFile, (eventType) => {
      if (eventType === 'change') {
        const newSettings = new YamlSettings(settingsFile)
        const newInfluxHost = newSettings.get('INFLUX_HOST')
        const newInfluxToken = newSettings.get('INFLUX_TOKEN')
        const newInfluxOrg = newSettings.get('INFLUX_ORG')
        const newInfluxBucket = newSettings.get('INFLUX_BUCKET')
        const newInterval = newSettings.get('INFLUX_INTERVAL') || 10

        if (newInfluxHost && newInfluxToken && newInfluxOrg && newInfluxBucket) {
          addOrUpdateJob(newInterval)
        }
      }
    })
  }
}
