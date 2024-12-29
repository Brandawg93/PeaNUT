'use server'

const settingsFile = './config/settings.yml'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import required modules
    const { YamlSettings } = await import('./server/settings')
    const { getDevices } = await import('./app/actions')
    const InfluxWriter = (await import('./server/influxdb')).default
    const { ToadScheduler, SimpleIntervalJob, Task } = await import('toad-scheduler')

    // Initialize settings and scheduler
    const settings = new YamlSettings(settingsFile)
    const scheduler = new ToadScheduler()

    // Get the current interval from settings or default to 10 seconds
    let currentInterval = settings.get('INFLUX_INTERVAL') || 10
    // Define the task to write data to InfluxDB
    const task = new Task('influx writer', () => {
      const taskSettings = new YamlSettings(settingsFile)
      const influxHost = taskSettings.get('INFLUX_HOST')
      const influxToken = taskSettings.get('INFLUX_TOKEN')
      const influxOrg = taskSettings.get('INFLUX_ORG')
      const influxBucket = taskSettings.get('INFLUX_BUCKET')

      // Check if all required InfluxDB settings are available
      if (influxHost && influxToken && influxOrg && influxBucket) {
        getDevices().then(async ({ devices }) => {
          try {
            const influxdata = new InfluxWriter(influxHost, influxToken, influxOrg, influxBucket)
            const writePromises = (devices || []).map((device) => influxdata.writePoint(device, new Date()))
            await Promise.all(writePromises)
            await influxdata.close()
          } catch (error) {
            console.error('Error writing to InfluxDB:', error)
          }
        })
      }
    })

    // Define the task to check and update the interval
    const intervalCheckTask = new Task('interval check', () => {
      const newSettings = new YamlSettings(settingsFile)
      const influxHost = newSettings.get('INFLUX_HOST')
      const influxToken = newSettings.get('INFLUX_TOKEN')
      const influxOrg = newSettings.get('INFLUX_ORG')
      const influxBucket = newSettings.get('INFLUX_BUCKET')

      // Check if the main job exists
      if (scheduler.existsById('id_1')) {
        // Remove the job if any required InfluxDB settings are missing
        if (!influxHost || !influxToken || !influxOrg || !influxBucket) {
          scheduler.removeById('id_1')
          return
        }

        // Update the interval if it has changed
        const newInterval = newSettings.get('INFLUX_INTERVAL') || 10
        if (newInterval !== currentInterval) {
          currentInterval = newInterval
          scheduler.removeById('id_1')
          scheduler.addSimpleIntervalJob(
            new SimpleIntervalJob({ seconds: currentInterval, runImmediately: true }, task, {
              id: 'id_1',
              preventOverrun: true,
            })
          )
        }
      } else {
        // Recreate the job if it doesn't exist and all settings are available
        if (influxHost && influxToken && influxOrg && influxBucket) {
          currentInterval = newSettings.get('INFLUX_INTERVAL') || 10
          scheduler.addSimpleIntervalJob(
            new SimpleIntervalJob({ seconds: currentInterval, runImmediately: true }, task, {
              id: 'id_1',
              preventOverrun: true,
            })
          )
        }
      }
    })

    // Create and add the interval check job to the scheduler
    const intervalCheckJob = new SimpleIntervalJob({ seconds: 30, runImmediately: true }, intervalCheckTask, {
      id: 'interval_check',
      preventOverrun: true,
    })
    scheduler.addSimpleIntervalJob(intervalCheckJob)
  }
}
