import PromiseSocket from '../../../src/server/promise-socket'

jest.mock('net', () => {
  const mSocket = {
    connect: jest.fn(),
    write: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    listenerCount: jest.fn(),
    off: jest.fn(),
    end: jest.fn(),
    once: jest.fn(),
    setMaxListeners: jest.fn(),
  }
  return { Socket: jest.fn(() => mSocket) }
})

describe('PromiseSocket', () => {
  let promiseSocket: PromiseSocket
  let mockSocket: any

  beforeEach(() => {
    promiseSocket = new PromiseSocket()
    mockSocket = (promiseSocket as any).innerSok
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // Helper function for timeout tests
  const testTimeout = async (operation: Promise<any>, timeout: number = 100) => {
    jest.useFakeTimers()
    const promise = operation
    jest.advanceTimersByTime(timeout)
    await expect(promise).rejects.toThrow('Operation timeout')
    jest.useRealTimers()
  }

  // Helper function for socket event mocking
  const mockSocketEvents = () => {
    const callbacks: Record<string, any> = {}
    mockSocket.on.mockImplementation((event: string, callback: any) => {
      callbacks[event] = callback
    })
    return callbacks
  }

  test('connect should reject on timeout', () => testTimeout(promiseSocket.connect(8080, 'localhost', 100)))

  test('write should reject on timeout', () => testTimeout(promiseSocket.write('data', 100)))

  test('readAll should reject on timeout', () => testTimeout(promiseSocket.readAll('COMMAND', 'END COMMAND', 100)))

  describe('close', () => {
    test('should end the socket connection and cleanup listeners', async () => {
      const callbacks = mockSocketEvents()
      const closePromise = promiseSocket.close()
      callbacks.end()

      await expect(closePromise).resolves.toBeUndefined()
      expect(mockSocket.end).toHaveBeenCalled()
      expect(mockSocket.off).toHaveBeenCalledWith('end', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })

    test('should reject on timeout', () => testTimeout(promiseSocket.close(100)))
  })

  describe('readAll', () => {
    test('should resolve when data contains until string', async () => {
      const callbacks = mockSocketEvents()
      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      callbacks.data(Buffer.from('some data END COMMAND'))

      await expect(readPromise).resolves.toBe('some data END COMMAND')
      expect(mockSocket.off).toHaveBeenCalledWith('data', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('end', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })

    test('should accumulate data until end string is found', async () => {
      const callbacks = mockSocketEvents()
      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      callbacks.data(Buffer.from('some '))
      callbacks.data(Buffer.from('data END '))
      callbacks.data(Buffer.from('COMMAND'))

      await expect(readPromise).resolves.toBe('some data END COMMAND')
    })

    test('should resolve on end event if data contains until string', async () => {
      const callbacks = mockSocketEvents()
      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      callbacks.data(Buffer.from('some data END COMMAND'))
      callbacks.end()

      await expect(readPromise).resolves.toBe('some data END COMMAND')
    })

    test('should reject on end event if data does not contain until string', async () => {
      const callbacks = mockSocketEvents()
      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      callbacks.data(Buffer.from('incomplete data'))
      callbacks.end()

      await expect(readPromise).rejects.toThrow('Connection closed before receiving complete data')
      expect(mockSocket.off).toHaveBeenCalledWith('data', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('end', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })

    test('should reject on timeout', () => testTimeout(promiseSocket.readAll('COMMAND', 'END COMMAND', 100)))

    test('should reject when data starts with ERR and contains newline', async () => {
      const callbacks = mockSocketEvents()
      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      callbacks.data(Buffer.from('ERR Invalid command\n'))

      await expect(readPromise).rejects.toThrow('ERR Invalid command\n')
      expect(mockSocket.off).toHaveBeenCalledWith('data', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('end', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })

    test('should not reject when data starts with ERR but no newline', async () => {
      const callbacks = mockSocketEvents()
      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      callbacks.data(Buffer.from('ERR Invalid command'))
      callbacks.data(Buffer.from('END COMMAND'))

      await expect(readPromise).resolves.toBe('ERR Invalid commandEND COMMAND')
    })

    test('should not reject when data contains ERR but does not start with it', async () => {
      const callbacks = mockSocketEvents()
      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      callbacks.data(Buffer.from('some ERR data\nEND COMMAND'))

      await expect(readPromise).resolves.toBe('some ERR data\nEND COMMAND')
    })
  })
})
