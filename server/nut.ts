import { Socket } from 'net';
import PromiseSocket from './promise-socket';

export class Nut {
  private socket: PromiseSocket;
  private host: string;
  private port: number;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.socket = new PromiseSocket(new Socket());
  }

  public async getData() {
    const command = 'LIST VAR UPS';
    await this.socket.connect(this.port, this.host);
    await this.socket.write(command);
    let data = await this.socket.readAll(command);
    await this.socket.write('LOGOUT');
    this.socket.close();
    data = data.replace('BEGIN ' + command, '');
    data = data.replace('END ' + command + '\n', '');
    data = data.replace(/VAR UPS /g, '');
    data = data.replace(/"/g, '');
    const props = data.trim().split('\n');
    const values: any = {};
    props.forEach((prop) => {
      const key = prop.substring(0, prop.indexOf(' ')).replace(/\./g, '_');
      const value = prop.substring(prop.indexOf(' ') + 1);
      values[key] = value;
    });
    return values;
  }
}
