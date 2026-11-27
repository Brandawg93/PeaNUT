import { NextRequest, NextResponse } from 'next/server'
import { getNutInstances } from '@/app/api/utils'
import { upsStatus } from '@/common/constants'
import { createDebugLogger } from '@/server/debug'

const debug = createDebugLogger('METRICS')

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

  const perInstanceMetrics = await Promise.allSettled(
    nutInstances.map(async (nut) => {
      const devices = await nut.getDevices()
      const serverInfo = `${nut.getHost()}:${nut.getPort()}`

      const perDeviceMetrics = await mapWithConcurrency(devices, PER_INSTANCE_CONCURRENCY, async (device) => {
        const data = await nut.getData(device.name).catch((error: unknown) => {
          debug.warn('Failed to read UPS metrics', {
            server: serverInfo,
            device: device.name,
            error: error instanceof Error ? error.message : String(error),
          })
          return null
        })
        if (!data || data['ups.status']?.value === upsStatus.DEVICE_UNREACHABLE) return null

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

      if (perDeviceMetrics.length > 0 && perDeviceMetrics.every((lines) => lines === null)) {
        throw new Error('Failed to read metrics from any discovered UPS')
      }

      return perDeviceMetrics.flatMap((lines) => lines ?? [])
    })
  )

  const errors: unknown[] = []
  const prometheusMetrics = perInstanceMetrics.flatMap((result, index) => {
    if (result.status === 'fulfilled') return result.value

    const nut = nutInstances[index]
    const error: unknown = result.reason
    debug.warn('Failed to collect metrics from NUT server', {
      server: `${nut.getHost()}:${nut.getPort()}`,
      error: error instanceof Error ? error.message : String(error),
    })
    errors.push(error)
    return []
  })

  if (errors.length > 0 && errors.length === nutInstances.length) {
    throw new AggregateError(errors, 'Failed to collect metrics from any NUT server')
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
