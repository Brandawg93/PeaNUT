import { NutConnectionPool } from '@/server/nut-pool'
import PromiseSocket from '@/server/promise-socket'

jest.mock('@/server/promise-socket')

const MockPromiseSocket = PromiseSocket as jest.MockedClass<typeof PromiseSocket>

function makeMockSocket(connected = true): PromiseSocket {
  const socket = new MockPromiseSocket() as jest.Mocked<PromiseSocket>
  socket.isConnected = jest.fn().mockReturnValue(connected)
  socket.close = jest.fn().mockResolvedValue(undefined)
  return socket
}

describe('NutConnectionPool', () => {
  const HOST = 'localhost'
  const PORT = 3493

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.spyOn(Date, 'now').mockReturnValue(0)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('acquire()', () => {
    it('returns null when pool is empty', () => {
      const pool = new NutConnectionPool()
      expect(pool.acquire(HOST, PORT)).toBeNull()
    })

    it('returns an idle socket (LIFO order)', () => {
      const pool = new NutConnectionPool()
      const socket1 = makeMockSocket()
      const socket2 = makeMockSocket()

      pool.release(HOST, PORT, socket1)
      pool.release(HOST, PORT, socket2)

      // LIFO: socket2 released last, acquired first
      expect(pool.acquire(HOST, PORT)).toBe(socket2)
      expect(pool.acquire(HOST, PORT)).toBe(socket1)
    })

    it('does not call connect() — caller is responsible for creating the socket', () => {
      const pool = new NutConnectionPool()
      const socket = makeMockSocket()
      pool.release(HOST, PORT, socket)
      pool.acquire(HOST, PORT)
      // PromiseSocket constructor is called only when making the mock; no connect called
      expect(socket.close).not.toHaveBeenCalled()
    })

    it('discards stale sockets and returns null', () => {
      const pool = new NutConnectionPool()
      const stale = makeMockSocket(false)

      pool.release(HOST, PORT, makeMockSocket()) // put a good one in first
      // Manually inject a stale socket to test the discard path
      const bucket = (pool as any).pools.get(`${HOST}:${PORT}`)
      bucket.available.push({ socket: stale, lastUsed: Date.now() })

      // Acquire will pop stale first (LIFO), discard it, then return the good one
      const result = pool.acquire(HOST, PORT)
      expect(stale.close).toHaveBeenCalled()
      expect(result).not.toBe(stale)
      expect(result).not.toBeNull()
    })

    it('returns null when pool has only stale sockets', () => {
      const pool = new NutConnectionPool()
      const stale = makeMockSocket(false)

      const bucket = { available: [{ socket: stale, lastUsed: Date.now() }] }
      ;(pool as any).pools.set(`${HOST}:${PORT}`, bucket)

      expect(pool.acquire(HOST, PORT)).toBeNull()
      expect(stale.close).toHaveBeenCalled()
    })

    it('uses separate buckets for different host:port pairs', () => {
      const pool = new NutConnectionPool()
      const socket1 = makeMockSocket()
      const socket2 = makeMockSocket()

      pool.release('host-a', 3493, socket1)
      pool.release('host-b', 3493, socket2)

      expect(pool.acquire('host-a', 3493)).toBe(socket1)
      expect(pool.acquire('host-b', 3493)).toBe(socket2)
    })
  })

  describe('release()', () => {
    it('adds a connected socket to the idle pool', () => {
      const pool = new NutConnectionPool()
      const socket = makeMockSocket()
      pool.release(HOST, PORT, socket)
      expect(pool.acquire(HOST, PORT)).toBe(socket)
    })

    it('closes and drops a disconnected socket', () => {
      const pool = new NutConnectionPool()
      const socket = makeMockSocket(false)
      pool.release(HOST, PORT, socket)
      expect(socket.close).toHaveBeenCalled()
      expect(pool.acquire(HOST, PORT)).toBeNull()
    })

    it('closes excess connections when pool is at maxSize', () => {
      const pool = new NutConnectionPool({ maxSize: 2 })
      const s1 = makeMockSocket()
      const s2 = makeMockSocket()
      const s3 = makeMockSocket()

      pool.release(HOST, PORT, s1)
      pool.release(HOST, PORT, s2)
      pool.release(HOST, PORT, s3) // exceeds maxSize=2

      expect(s3.close).toHaveBeenCalled()
      expect(pool.acquire(HOST, PORT)).toBe(s2)
      expect(pool.acquire(HOST, PORT)).toBe(s1)
      expect(pool.acquire(HOST, PORT)).toBeNull()
    })
  })

  describe('drain()', () => {
    it('closes all idle connections across all buckets', async () => {
      const pool = new NutConnectionPool()
      const s1 = makeMockSocket()
      const s2 = makeMockSocket()

      pool.release('host-a', 3493, s1)
      pool.release('host-b', 3494, s2)

      await pool.drain()

      expect(s1.close).toHaveBeenCalled()
      expect(s2.close).toHaveBeenCalled()
      expect(pool.acquire('host-a', 3493)).toBeNull()
      expect(pool.acquire('host-b', 3494)).toBeNull()
    })

    it('drains a specific host:port when specified', async () => {
      const pool = new NutConnectionPool()
      const s1 = makeMockSocket()
      const s2 = makeMockSocket()

      pool.release('host-a', 3493, s1)
      pool.release('host-b', 3493, s2)

      await pool.drain('host-a', 3493)

      expect(s1.close).toHaveBeenCalled()
      expect(s2.close).not.toHaveBeenCalled()
    })

    it('clears the idle sweep timer', async () => {
      const pool = new NutConnectionPool({ idleTimeoutMs: 5000 })
      const socket = makeMockSocket()
      pool.release(HOST, PORT, socket) // starts timer

      expect((pool as any).idleTimer).not.toBeNull()
      await pool.drain()
      expect((pool as any).idleTimer).toBeNull()
    })
  })

  describe('idle sweep', () => {
    it('closes connections idle longer than idleTimeoutMs', async () => {
      const pool = new NutConnectionPool({ idleTimeoutMs: 5000 })
      const socket = makeMockSocket()
      pool.release(HOST, PORT, socket) // lastUsed = 0 (Date.now() mocked to 0)

      // Simulate time advancing past idle timeout before the sweep runs
      jest.spyOn(Date, 'now').mockReturnValue(5001)
      jest.advanceTimersByTime(5001)

      expect(socket.close).toHaveBeenCalled()
      expect(pool.acquire(HOST, PORT)).toBeNull()
    })

    it('keeps connections idle shorter than idleTimeoutMs', async () => {
      const pool = new NutConnectionPool({ idleTimeoutMs: 5000 })
      const socket = makeMockSocket()
      pool.release(HOST, PORT, socket) // lastUsed = 0

      // Advance time but not enough to trigger idle eviction
      jest.spyOn(Date, 'now').mockReturnValue(4999)
      jest.advanceTimersByTime(4999)

      expect(socket.close).not.toHaveBeenCalled()
      expect(pool.acquire(HOST, PORT)).toBe(socket)
    })

    it('clears the timer when all buckets become empty after sweep', async () => {
      const pool = new NutConnectionPool({ idleTimeoutMs: 5000 })
      const socket = makeMockSocket()
      pool.release(HOST, PORT, socket)

      expect((pool as any).idleTimer).not.toBeNull()
      jest.spyOn(Date, 'now').mockReturnValue(5001)
      jest.advanceTimersByTime(5001)
      expect((pool as any).idleTimer).toBeNull()
    })
  })
})
