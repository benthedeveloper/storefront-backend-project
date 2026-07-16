import app from './app.ts';

const PORT = process.env.PORT || process.env.SERVER_PORT || '3000';

const address = `0.0.0.0:${PORT}`;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Starting app on: http://${address}`);
});
