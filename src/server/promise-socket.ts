import { Socket } from 'net'

const TIMEOUT = 10000

export default class PromiseSocket {
  private innerSok: Socket = new Socket()

  private setTimeoutPromise(timeout: number): Promise<any> {
    return new Promise<any>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)
    })
  }

  public connect(port: number, host: string, timeout = TIMEOUT): Promise<void> {
    return Promise.race([
      new Promise<void>((resolve, reject) => {
        this.innerSok.connect(port, host, resolve)
        this.innerSok.on('error', reject)
      }),
      this.setTimeoutPromise(timeout),
    ])
  }

  async write(data: string, timeout = TIMEOUT): Promise<void> {
    return Promise.race([
      new Promise<void>((resolve, reject) => {
        this.innerSok.write(`${data}\n`, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
        this.innerSok.on('error', reject)
      }),
      this.setTimeoutPromise(timeout),
    ])
  }

  async readAll(command: string, until: string = `END ${command}`, timeout = TIMEOUT): Promise<string> {
    return Promise.race([
      new Promise<string>((resolve, reject) => {
        let buf = ''
        this.innerSok.on('data', (data) => {
          buf += data.toString()
          if (buf.includes(until)) {
            resolve(buf)
          }
        })
        this.innerSok.on('error', reject)
        this.innerSok.on('end', () => resolve(buf))
      }),
      this.setTimeoutPromise(timeout),
    ])
  }

  async close(timeout = TIMEOUT): Promise<void> {
    this.innerSok.end()
    return Promise.race([
      new Promise<void>((resolve, reject) => {
        this.innerSok.on('end', resolve)
        this.innerSok.on('error', reject)
      }),
      this.setTimeoutPromise(timeout),
    ])
  }
}
