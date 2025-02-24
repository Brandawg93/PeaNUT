import { Socket } from 'net'

const TIMEOUT = 10000
const MAX_LISTENERS = 9

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

  private addErrorHandler(reject: (reason?: any) => void): void {
    if (this.innerSok.listenerCount('error') < MAX_LISTENERS) {
      this.innerSok.once('error', reject)
    }
  }

  public connect(port: number, host: string, timeout = TIMEOUT): Promise<void> {
    return this.raceWithTimeout(
      new Promise<void>((resolve, reject) => {
        this.addErrorHandler(reject)
        this.innerSok.connect(port, host, resolve)
      }),
      timeout
    )
  }

  async write(data: string, timeout = TIMEOUT): Promise<void> {
    return this.raceWithTimeout(
      new Promise<void>((resolve, reject) => {
        this.addErrorHandler(reject)
        this.innerSok.write(`${data}\n`, (err) => {
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
        }

        const onEnd = () => {
          cleanup()
          if (!buf.includes(until)) {
            reject(new Error('Connection closed before receiving complete data'))
          } else {
            resolve(buf)
          }
        }

        const cleanup = () => {
          this.innerSok.off('data', onData)
          this.innerSok.off('end', onEnd)
          this.innerSok.off('error', reject)
        }

        this.innerSok.on('data', onData)
        this.innerSok.on('end', onEnd)
        this.addErrorHandler(reject)
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
