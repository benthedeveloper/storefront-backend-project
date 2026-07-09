import express from 'express';
import books from './api/books.ts';
import users from './api/users.ts';
import dashboard from './api/dashboard.ts';

const routes = express.Router();

routes.get('/', (req, res) => {
  // TODO update this?
  res.send('Main api route');
});

routes.use('/books', books);
routes.use('/users', users);
routes.use('/dashboard', dashboard);

export default routes;
