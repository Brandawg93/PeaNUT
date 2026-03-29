import PromiseSocket from '@/server/promise-socket'

interface PooledConnection {
  socket: PromiseSocket
  lastUsed: number
}

interface PoolBucket {
  available: PooledConnection[]
}

export interface NutConnectionPoolOptions {
  maxSize?: number
  idleTimeoutMs?: number
}

export class NutConnectionPool {
  private readonly pools: Map<string, PoolBucket> = new Map()
  private readonly maxSize: number
  private readonly idleTimeoutMs: number
  private idleTimer: ReturnType<typeof setInterval> | null = null

  constructor(options?: NutConnectionPoolOptions) {
    this.maxSize = options?.maxSize ?? 3
    this.idleTimeoutMs = options?.idleTimeoutMs ?? 30_000
  }

  private bucketKey(host: string, port: number): string {
    return `${host}:${port}`
  }

  private getOrCreateBucket(key: string): PoolBucket {
    let bucket = this.pools.get(key)
    if (!bucket) {
      bucket = { available: [] }
      this.pools.set(key, bucket)
    }
    return bucket
  }

  /**
   * Acquire an idle connection for the given host/port.
   * Returns null if no idle connection is available — caller should create a new one.
   */
  acquire(host: string, port: number): PromiseSocket | null {
    const key = this.bucketKey(host, port)
    const bucket = this.pools.get(key)
    if (!bucket) return null

    // LIFO: prefer most recently used (keeps connections warm)
    while (bucket.available.length > 0) {
      const entry = bucket.available.pop()!
      if (entry.socket.isConnected()) {
        // Remove empty bucket to keep the map tidy
        if (bucket.available.length === 0) this.pools.delete(key)
        return entry.socket
      }
      // Stale connection: discard
      entry.socket.close().catch(() => {})
    }

    // All entries were stale — remove the now-empty bucket
    this.pools.delete(key)
    return null
  }

  /**
   * Return a connection to the idle pool.
   * If the pool is full or the socket is no longer connected, the socket is closed.
   */
  release(host: string, port: number, socket: PromiseSocket): void {
    if (!socket.isConnected()) {
      socket.close().catch(() => {})
      return
    }

    const key = this.bucketKey(host, port)
    const bucket = this.getOrCreateBucket(key)

    if (bucket.available.length >= this.maxSize) {
      // Pool is at capacity: close the excess connection
      socket.close().catch(() => {})
      return
    }

    bucket.available.push({ socket, lastUsed: Date.now() })
    this.scheduleIdleSweep()
  }

  /**
   * Close all idle connections, optionally scoped to one host/port.
   */
  async drain(host?: string, port?: number): Promise<void> {
    const scopedDrain = host !== undefined && port !== undefined
    const keysToDrain = scopedDrain ? [this.bucketKey(host, port)] : Array.from(this.pools.keys())

    for (const key of keysToDrain) {
      const bucket = this.pools.get(key)
      if (!bucket) continue
      for (const entry of bucket.available) {
        await entry.socket.close().catch(() => {})
      }
      this.pools.delete(key)
    }

    // Only clear the sweep timer when all buckets have been drained
    if (!scopedDrain || this.pools.size === 0) {
      if (this.idleTimer !== null) {
        clearInterval(this.idleTimer)
        this.idleTimer = null
      }
    }
  }

  private scheduleIdleSweep(): void {
    if (this.idleTimer !== null) return
    this.idleTimer = setInterval(() => this.sweepIdle(), this.idleTimeoutMs)
    // Allow the process to exit even if idle connections remain
    if (typeof this.idleTimer === 'object' && 'unref' in this.idleTimer) {
      ;(this.idleTimer as NodeJS.Timeout).unref()
    }
  }

  private sweepIdle(): void {
    const now = Date.now()

    this.pools.forEach((bucket, key) => {
      bucket.available = bucket.available.filter((entry: PooledConnection) => {
        if (now - entry.lastUsed > this.idleTimeoutMs) {
          entry.socket.close().catch(() => {})
          return false
        }
        return true
      })
      // Remove empty buckets to keep the map tidy
      if (bucket.available.length === 0) {
        this.pools.delete(key)
      }
    })

    if (this.pools.size === 0 && this.idleTimer !== null) {
      clearInterval(this.idleTimer)
      this.idleTimer = null
    }
  }
}

export const nutConnectionPool = new NutConnectionPool()

// beforeExit fires when the event loop drains — async drain() can complete here.
// process.on('exit') is synchronous and would not await the drain promise.
process.once('beforeExit', () => {
  nutConnectionPool.drain().catch(() => {})
})
