import app from './app.ts';

const { SERVER_PORT } = process.env;

if (!SERVER_PORT) {
  throw new Error('SERVER_PORT is not defined in the environment variables');
}

const address: string = `0.0.0.0:${SERVER_PORT}`;

app.listen(SERVER_PORT, () => {
  console.log(`Starting app on: ${address}`);
});
