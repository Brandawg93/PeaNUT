import express, { Express, Request, Response } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { Nut } from './nut';
import schema from './schema';

dotenv.config();

const app: Express = express();
const port = process.env.WEB_PORT || 8080;

if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/api/ping', (req: Request, res: Response) => {
  res.send('pong');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.get('/api/v1/devices/:device', async (req, res) => {
  const device = req.params.device;
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD,
  );
  await nut.connect();
  const devices = await nut.getDevices();
  if (!devices.includes(device)) {
    res.status(404).send(`Device ${device} not found`);
    return;
  }
  const data = await nut.getData(device);
  await nut.close();
  res.send(data);
});

app.get('/api/v1/devices', async (req, res) => {
  const nut = new Nut(
    process.env.NUT_HOST || 'localhost',
    parseInt(process.env.NUT_PORT || '3493'),
    process.env.USERNAME,
    process.env.PASSWORD,
  );
  await nut.connect();
  const devices = await nut.getDevices();
  const promises = [];
  for (const device of devices) {
    const promise = nut.getData(device);
    promises.push(promise);
  }
  const data = await Promise.all(promises);
  await nut.close();
  res.send(data);
});

app.all('/graphql', createHandler({ schema }));

app.listen(port, () => {
  console.log(`⚡️[nut-dashboard]: Server is running at http://localhost:${port}`);
});
