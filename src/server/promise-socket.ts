import { Socket } from 'net'

const TIMEOUT = 10000

export default class PromiseSocket {
  private readonly innerSok: Socket = new Socket()

  public isConnected(): boolean {
    return this.innerSok && !this.innerSok.destroyed && this.innerSok.readable && this.innerSok.writable
  }

  private setTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timeout'))
      }, timeout)
    })
  }

  private raceWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([promise, this.setTimeoutPromise(timeout)])
  }

  public connect(port: number, host: string, timeout = TIMEOUT): Promise<void> {
    return this.raceWithTimeout(
      new Promise<void>((resolve, reject) => {
        const onError = (error: Error) => {
          this.innerSok.off('error', onError)
          reject(error)
        }

        this.innerSok.once('error', onError)
        this.innerSok.connect(port, host, () => {
          this.innerSok.off('error', onError)
          resolve()
        })
      }),
      timeout
    )
  }

  async write(data: string, timeout = TIMEOUT): Promise<void> {
    return this.raceWithTimeout(
      new Promise<void>((resolve, reject) => {
        const onError = (error: Error) => {
          this.innerSok.off('error', onError)
          reject(error)
        }

        this.innerSok.once('error', onError)
        this.innerSok.write(`${data}\n`, (err) => {
          this.innerSok.off('error', onError)
          if (err) reject(new Error(`${err}`))
          else resolve()
        })
      }),
      timeout
    )
  }

  async readAll(command: string, until: string = `END ${command}`, timeout = TIMEOUT): Promise<string> {
    return this.raceWithTimeout(
      new Promise<string>((resolve, reject) => {
        let buf = ''

        const onData = (data: Buffer) => {
          buf += data.toString()
          if (buf.includes(until)) {
            cleanup()
            resolve(buf)
          }
          if (buf.startsWith('ERR')) {
            const newlineIndex = buf.indexOf('\n')
            if (newlineIndex !== -1) {
              cleanup()
              reject(new Error(buf.slice(0, newlineIndex + 1)))
              return
            }
          }
        }

        const onEnd = () => {
          cleanup()
          if (!buf.includes(until)) {
            reject(new Error('Connection closed before receiving complete data'))
          } else {
            resolve(buf)
          }
        }

        const onError = (error: Error) => {
          cleanup()
          reject(error)
        }

        const cleanup = () => {
          this.innerSok.off('data', onData)
          this.innerSok.off('end', onEnd)
          this.innerSok.off('error', onError)
        }

        this.innerSok.on('data', onData)
        this.innerSok.on('end', onEnd)
        this.innerSok.once('error', onError)
      }),
      timeout
    )
  }

  async close(timeout = TIMEOUT): Promise<void> {
    return this.raceWithTimeout(
      new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          this.innerSok.off('end', onEnd)
          this.innerSok.off('error', onError)
        }

        const onEnd = () => {
          cleanup()
          resolve()
        }

        const onError = (error: Error) => {
          cleanup()
          reject(error)
        }

        this.innerSok.end()
        this.innerSok.on('end', onEnd)
        this.innerSok.once('error', onError)
      }),
      timeout
    )
  }
}
