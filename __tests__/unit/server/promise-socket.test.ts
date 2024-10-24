import PromiseSocket from '../../../src/server/promise-socket'
import { Socket } from 'net'

jest.mock('net', () => {
  const mSocket = {
    connect: jest.fn(),
    write: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    end: jest.fn(),
  }
  return { Socket: jest.fn(() => mSocket) }
})

describe('PromiseSocket', () => {
  let promiseSocket: PromiseSocket
  let mockSocket: jest.Mocked<Socket>

  beforeEach(() => {
    promiseSocket = new PromiseSocket()
    mockSocket = (promiseSocket as any).innerSok
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('connect should reject on timeout', async () => {
    jest.useFakeTimers()
    const connectPromise = promiseSocket.connect(8080, 'localhost', 100)
    jest.advanceTimersByTime(100)
    await expect(connectPromise).rejects.toThrow('Timeout')
    jest.useRealTimers()
  })

  test('write should reject on timeout', async () => {
    jest.useFakeTimers()
    const writePromise = promiseSocket.write('data', 100)
    jest.advanceTimersByTime(100)
    await expect(writePromise).rejects.toThrow('Timeout')
    jest.useRealTimers()
  })

  test('readAll should reject on timeout', async () => {
    jest.useFakeTimers()
    const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND', 100)
    jest.advanceTimersByTime(100)
    await expect(readPromise).rejects.toThrow('Timeout')
    jest.useRealTimers()
  })

  test('close should end the socket connection', () => {
    promiseSocket.close()
    expect(mockSocket.end).toHaveBeenCalled()
  })
})
