import { Socket } from 'net'

export default class PromiseSocket {
  private innerSok: Socket = new Socket()

  public connect(port: number, host: string, timeout = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)

      this.innerSok.connect(port, host, () => {
        resolve()
      })
      this.innerSok.on('error', (err) => {
        reject(err)
      })
    })
  }

  async write(data: string, timeout = 10000) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)

      this.innerSok.write(`${data}\n`, () => {
        resolve()
      })
      this.innerSok.on('error', (err) => {
        reject(err)
      })
    })
  }

  async readAll(command: string, until: string = `END ${command}`, timeout = 10000) {
    return new Promise<string>((resolve, reject) => {
      let buf = ''
      setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)
      this.innerSok.on('data', (data) => {
        buf += Buffer.from(data).toString()
        if (buf.includes(until)) {
          resolve(buf)
        }
      })
      this.innerSok.on('error', (err) => {
        reject(err)
      })
      this.innerSok.on('end', () => {
        resolve(buf)
      })
    })
  }

  async close(timeout = 10000) {
    this.innerSok.end()
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)

      this.innerSok.on('end', () => {
        resolve()
      })
      this.innerSok.on('error', (err) => {
        reject(err)
      })
    })
  }
}
