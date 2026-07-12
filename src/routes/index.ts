import express from 'express';
import products from './api/products.ts';
import orders from './api/orders.ts';
import users from './api/users.ts';
import dashboard from './api/dashboard.ts';

const routes = express.Router();

routes.get('/', (req, res) => {
  // TODO update this?
  res.send('Main api route');
});

routes.use('/products', products);
routes.use('/orders', orders);
routes.use('/users', users);
routes.use('/dashboard', dashboard);

export default routes;
