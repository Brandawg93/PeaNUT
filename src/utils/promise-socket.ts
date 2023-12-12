import { Socket } from 'net';

export default class PromiseSocket {
  private innerSok: Socket = new Socket();

  public connect(port: number, host: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.innerSok.connect(port, host, () => {
        resolve();
      });
      this.innerSok.on('error', (err) => {
        reject(err);
      });
    });
  }

  async write(data: string) {
    return new Promise<void>((resolve, reject) => {
      this.innerSok.write(`${data}\n`, () => {
        resolve();
      });
      this.innerSok.on('error', (err) => {
        reject(err);
      });
    });
  }

  async readAll(command: string, until: string = `END ${command}`) {
    return new Promise<string>((resolve, reject) => {
      let buf = '';
      this.innerSok.on('data', (data) => {
        buf += Buffer.from(data).toString();
        if (buf.includes(until)) {
          resolve(buf);
        }
      });
      this.innerSok.on('error', (err) => {
        reject(err);
      });
      this.innerSok.on('end', () => {
        resolve(buf);
      });
    });
  }

  close() {
    this.innerSok.end();
  }
}
