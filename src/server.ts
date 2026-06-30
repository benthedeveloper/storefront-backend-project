import express, { type Request, type Response } from 'express';
import bodyParser from 'body-parser';

const { SERVER_PORT } = process.env;

if (!SERVER_PORT) {
  throw new Error('SERVER_PORT is not defined in the environment variables');
}

const app: express.Application = express();
const address: string = `0.0.0.0:${SERVER_PORT}`;

app.use(bodyParser.json());

app.get('/', function (req: Request, res: Response) {
  res.send('Hello World!');
});

app.listen(SERVER_PORT, function () {
  console.log(`starting app on: ${address}`);
});
