import express, { Express, Request, Response } from 'express';
import { graphqlHTTP } from 'express-graphql';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import schema from './schema';
import { Nut } from './nut';

dotenv.config();

// The root provides a resolver function for each API endpoint
const root = {
  ups: async () => {
    const nut = new Nut(process.env.NUT_HOST || 'localhost', parseInt(process.env.NUT_PORT || '3493'));
    return await nut.getData();
  },
  updated: () => {
    return Math.floor(Date.now() / 1000);
  },
};

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

app.all(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }),
);

app.listen(port, () => {
  console.log(`⚡️[nut-dashboard]: Server is running at http://localhost:${port}`);
});
