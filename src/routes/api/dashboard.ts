import { Router } from 'express';
import { productsInOrders } from '../../handlers/dashboard.ts';

const dashboard = Router();

// Route to get all products that have been included in orders
dashboard.get('/products-in-orders', productsInOrders);

export default dashboard;
