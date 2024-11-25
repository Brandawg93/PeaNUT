'use server'

const settingsFile = './config/settings.yml'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Writer = (await import('./server/writer')).default
    const { YamlSettings } = await import('./server/settings')
    const settings = new YamlSettings(settingsFile)
    const writer = new Writer()

    setInterval(
      async () => {
        settings.load()
        const influxHost = settings.get('INFLUX_HOST')
        const influxToken = settings.get('INFLUX_TOKEN')
        const influxOrg = settings.get('INFLUX_ORG')
        const influxBucket = settings.get('INFLUX_BUCKET')
        if (influxHost && influxToken && influxOrg && influxBucket) {
          await writer.start()
        } else if (writer.isWriting()) {
          await writer.stop()
        }
      },
      settings.get('INFLUX_INTERVAL') || 10 * 1000
    )
  }
}
