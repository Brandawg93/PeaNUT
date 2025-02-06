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

  test('connect should reject on timeout', async () => {
    jest.useFakeTimers()
    const connectPromise = promiseSocket.connect(8080, 'localhost', 100)
    jest.advanceTimersByTime(100)
    await expect(connectPromise).rejects.toThrow('Operation timeout')
    jest.useRealTimers()
  })

  test('write should reject on timeout', async () => {
    jest.useFakeTimers()
    const writePromise = promiseSocket.write('data', 100)
    jest.advanceTimersByTime(100)
    await expect(writePromise).rejects.toThrow('Operation timeout')
    jest.useRealTimers()
  })

  test('readAll should reject on timeout', async () => {
    jest.useFakeTimers()
    const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND', 100)
    jest.advanceTimersByTime(100)
    await expect(readPromise).rejects.toThrow('Operation timeout')
    jest.useRealTimers()
  })

  describe('close', () => {
    test('should end the socket connection and cleanup listeners', async () => {
      let endCallback: () => void
      mockSocket.on.mockImplementation((event: string, callback: () => void) => {
        if (event === 'end') endCallback = callback
      })

      const closePromise = promiseSocket.close()
      endCallback!()

      await expect(closePromise).resolves.toBeUndefined()
      expect(mockSocket.end).toHaveBeenCalled()
      expect(mockSocket.off).toHaveBeenCalledWith('end', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })

    test('should reject on timeout', async () => {
      jest.useFakeTimers()
      const closePromise = promiseSocket.close(100)
      jest.advanceTimersByTime(100)
      await expect(closePromise).rejects.toThrow('Operation timeout')
      jest.useRealTimers()
    })
  })

  describe('readAll', () => {
    test('should resolve when data contains until string', async () => {
      let dataCallback: (data: Buffer) => void
      mockSocket.on.mockImplementation((event: string, callback: any) => {
        if (event === 'data') dataCallback = callback
      })

      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      dataCallback!(Buffer.from('some data END COMMAND'))

      await expect(readPromise).resolves.toBe('some data END COMMAND')
      expect(mockSocket.off).toHaveBeenCalledWith('data', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('end', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })

    test('should accumulate data until end string is found', async () => {
      let dataCallback: (data: Buffer) => void
      mockSocket.on.mockImplementation((event: string, callback: any) => {
        if (event === 'data') dataCallback = callback
      })

      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      dataCallback!(Buffer.from('some '))
      dataCallback!(Buffer.from('data END '))
      dataCallback!(Buffer.from('COMMAND'))

      await expect(readPromise).resolves.toBe('some data END COMMAND')
    })

    test('should resolve on end event if data contains until string', async () => {
      let dataCallback: (data: Buffer) => void
      let endCallback: () => void
      mockSocket.on.mockImplementation((event: string, callback: any) => {
        if (event === 'data') dataCallback = callback
        if (event === 'end') endCallback = callback
      })

      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      dataCallback!(Buffer.from('some data END COMMAND'))
      endCallback!()

      await expect(readPromise).resolves.toBe('some data END COMMAND')
    })

    test('should reject on end event if data does not contain until string', async () => {
      let dataCallback: (data: Buffer) => void
      let endCallback: () => void
      mockSocket.on.mockImplementation((event: string, callback: any) => {
        if (event === 'data') dataCallback = callback
        if (event === 'end') endCallback = callback
      })

      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND')
      dataCallback!(Buffer.from('incomplete data'))
      endCallback!()

      await expect(readPromise).rejects.toThrow('Connection closed before receiving complete data')
      expect(mockSocket.off).toHaveBeenCalledWith('data', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('end', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
    })

    test('should reject on timeout', async () => {
      jest.useFakeTimers()
      const readPromise = promiseSocket.readAll('COMMAND', 'END COMMAND', 100)
      jest.advanceTimersByTime(100)
      await expect(readPromise).rejects.toThrow('Operation timeout')
      jest.useRealTimers()
    })
  })
})
