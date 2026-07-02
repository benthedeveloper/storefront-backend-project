import express from 'express';
import books from './api/books.ts';

const routes = express.Router();

routes.get('/', (req, res) => {
  // TODO update this?
  res.send('Main api route');
});

routes.use('/books', books);

export default routes;
