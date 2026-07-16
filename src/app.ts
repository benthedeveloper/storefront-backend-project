import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes/index.ts';

const app: express.Application = express();

const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// This ensures your endpoints match: /api/users, etc.
app.use('/api', routes);

export default app;
