import { NextRequest, NextResponse } from 'next/server'
import { getNutInstances } from '@/app/api/utils'

/**
 * Retrieves device metrics in Prometheus format from the NUT server.
 *
 * @swagger
 * /api/v1/metrics:
 *   get:
 *     summary: Retrieves Prometheus metrics from all UPS devices
 *     responses:
 *       '200':
 *         description: Successful response with Prometheus formatted metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *     tags:
 *       - Metrics
 */

// Helper function to convert data key to prometheus metric name
function toMetricName(key: string): string {
  // Convert to lowercase and replace dots/spaces with underscores
  return `ups_${key.toLowerCase().replace(/[\s.]/g, '_')}`
}

// Helper function to check if value is numeric
function isNumeric(value: string | number): boolean {
  return !isNaN(Number(value))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const nutInstances = await getNutInstances()
  const prometheusMetrics: string[] = []

  for (const nut of nutInstances) {
    const devices = await nut.getDevices()
    const serverInfo = `${nut.getHost()}:${nut.getPort()}`

    for (const device of devices) {
      const data = await nut.getData(device.name)

      for (const [key, value] of Object.entries(data)) {
        // Only process numeric values
        if (isNumeric(value.value)) {
          const metricName = toMetricName(key)
          const metricValue = Number(value.value)
          const metricDescription = value.description ?? 'N/A'

          // Add labels for the device including server for multi-server disambiguation
          const labels = `ups="${device.name}",server="${serverInfo}"`
          prometheusMetrics.push(`# HELP ${metricName} ${metricDescription}`)
          prometheusMetrics.push(`# TYPE ${metricName} gauge`)
          prometheusMetrics.push(`${metricName}{${labels}} ${metricValue}`)
        }
      }
    }
  }

  // Return metrics with proper content type
  return new NextResponse(prometheusMetrics.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4',
    },
  })
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
