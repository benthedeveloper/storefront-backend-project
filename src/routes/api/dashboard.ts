import { Router } from 'express';
import { productsInOrders, usersWithOrders, getMostExpensiveProducts } from '../../handlers/dashboard.ts';

const dashboard = Router();

// Route to get all products that have been included in orders
dashboard.get('/products-in-orders', productsInOrders);

// Route to get all users with orders
dashboard.get('/users-with-orders', usersWithOrders);

// Route to get the N most expensive products, sorted in descending order
dashboard.get('/most-expensive-products', getMostExpensiveProducts);

export default dashboard;
