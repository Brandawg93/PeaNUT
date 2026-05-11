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

// Per-instance concurrency cap for getData() calls. Aligned with the NUT
// connection pool's idle-retention size so a Prometheus scrape doesn't burst
// far past what the pool can absorb (pool only caps idle sockets; without
// this cap, N devices means N simultaneous TCP connections per scrape).
const PER_INSTANCE_CONCURRENCY = 3

async function mapWithConcurrency<T, R>(
  items: ReadonlyArray<T>,
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<Array<R>> {
  const results: Array<R> = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++
      if (i >= items.length) return
      results[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return results
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const nutInstances = await getNutInstances()
  const prometheusMetrics: string[] = []

  const perInstanceMetrics = await Promise.all(
    nutInstances.map(async (nut) => {
      const devices = await nut.getDevices()
      const serverInfo = `${nut.getHost()}:${nut.getPort()}`

      const perDeviceMetrics = await mapWithConcurrency(devices, PER_INSTANCE_CONCURRENCY, async (device) => {
        const data = await nut.getData(device.name)
        const lines: string[] = []

        for (const [key, value] of Object.entries(data)) {
          if (isNumeric(value.value)) {
            const metricName = toMetricName(key)
            const metricValue = Number(value.value)
            const metricDescription = value.description ?? 'N/A'
            const labels = `ups="${device.name}",server="${serverInfo}"`
            lines.push(
              `# HELP ${metricName} ${metricDescription}`,
              `# TYPE ${metricName} gauge`,
              `${metricName}{${labels}} ${metricValue}`
            )
          }
        }
        return lines
      })
      return perDeviceMetrics.flat()
    })
  )
  prometheusMetrics.push(...perInstanceMetrics.flat())

  // Return metrics with proper content type
  return new NextResponse(prometheusMetrics.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4',
    },
  })
}

// forces the route handler to be dynamic
export const dynamic = 'force-dynamic'
