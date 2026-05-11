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
    mockSocket.once.mockImplementation((event: string, callback: any) => {
      callbacks[event] = callback
    })
    return callbacks
  }

  test('connect should reject on timeout', () => testTimeout(promiseSocket.connect(8080, 'localhost', 100)))

  test('write should reject on timeout', () => testTimeout(promiseSocket.write('data', 100)))

  test('readAll should reject on timeout', () => testTimeout(promiseSocket.readAll('COMMAND', 'END COMMAND', 100)))

  describe('connect', () => {
    afterEach(() => {
      mockSocket.connect.mockReset()
    })

    test('should resolve when underlying socket connect callback fires', async () => {
      mockSocket.connect.mockImplementation((_port: number, _host: string, cb: () => void) => cb())
      await expect(promiseSocket.connect(8080, 'localhost')).resolves.toBeUndefined()
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })

    test('should reject when the socket emits an error', async () => {
      mockSocket.connect.mockImplementation(() => {})
      const callbacks = mockSocketEvents()
      const connectPromise = promiseSocket.connect(8080, 'localhost')
      callbacks.error(new Error('boom'))
      await expect(connectPromise).rejects.toThrow('boom')
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })

  describe('write', () => {
    afterEach(() => {
      mockSocket.write.mockReset()
    })

    test('should resolve when underlying write succeeds', async () => {
      mockSocket.write.mockImplementation((_data: string, cb: (err?: Error) => void) => cb())
      await expect(promiseSocket.write('hello')).resolves.toBeUndefined()
      expect(mockSocket.write).toHaveBeenCalledWith('hello\n', expect.any(Function))
    })

    test('should reject when underlying write callback returns an error', async () => {
      mockSocket.write.mockImplementation((_data: string, cb: (err: Error) => void) => cb(new Error('write fail')))
      await expect(promiseSocket.write('hello')).rejects.toThrow('write fail')
    })

    test('should reject when the socket emits an error before write callback', async () => {
      mockSocket.write.mockImplementation(() => {})
      const callbacks = mockSocketEvents()
      const writePromise = promiseSocket.write('hello')
      callbacks.error(new Error('socket lost'))
      await expect(writePromise).rejects.toThrow('socket lost')
    })
  })

  describe('readAll error handling', () => {
    test('should reject when the socket emits an error', async () => {
      const callbacks = mockSocketEvents()
      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      callbacks.error(new Error('socket exploded'))
      await expect(readPromise).rejects.toThrow('socket exploded')
      expect(mockSocket.off).toHaveBeenCalledWith('data', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('end', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })

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

    test('should reject when the socket emits an error', async () => {
      const callbacks = mockSocketEvents()
      const closePromise = promiseSocket.close()
      callbacks.error(new Error('close fail'))
      await expect(closePromise).rejects.toThrow('close fail')
      expect(mockSocket.off).toHaveBeenCalledWith('end', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })

  describe('isConnected', () => {
    test('returns false when the socket has been destroyed', () => {
      Object.defineProperty(mockSocket, 'destroyed', { value: true, configurable: true })
      Object.defineProperty(mockSocket, 'readable', { value: true, configurable: true })
      Object.defineProperty(mockSocket, 'writable', { value: true, configurable: true })
      expect(promiseSocket.isConnected()).toBe(false)
    })

    test('returns true when the socket is alive and readable/writable', () => {
      Object.defineProperty(mockSocket, 'destroyed', { value: false, configurable: true })
      Object.defineProperty(mockSocket, 'readable', { value: true, configurable: true })
      Object.defineProperty(mockSocket, 'writable', { value: true, configurable: true })
      expect(promiseSocket.isConnected()).toBe(true)
    })
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
