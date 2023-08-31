import express, { Express, Request, Response } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import schema from './schema';

dotenv.config();

const app: Express = express();
const port = process.env.WEB_PORT || 8080;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/api/ping', (req: Request, res: Response) => {
  res.send('pong');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.all('/graphql', createHandler({ schema }));

app.listen(port, () => {
  console.log(`⚡️[nut-dashboard]: Server is running at http://localhost:${port}`);
});
