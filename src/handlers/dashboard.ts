import { type Request, type Response } from 'express';
import { DashboardQueries } from '../services/dashboard.ts';

const DEFAULT_PRODUCT_LIMIT = 5;

const dashboard = new DashboardQueries();

export const productsInOrders = async (_req: Request, res: Response) => {
  try {
    const products = await dashboard.productsInOrders();
    res.status(200).json(products);
  } catch (error) {
    console.error('productsInOrders error', error);
    res.status(500).json({ error: 'Failed to fetch products in orders' });
  }
};

export const usersWithOrders = async (req: Request, res: Response) => {
  try {
    const users = await dashboard.usersWithOrders();
    res.status(200).json(users);
  } catch (error) {
    console.error('usersWithOrders error', error);
    res.status(500).json({ error: 'Failed to fetch all users with orders' });
  }
};

export const getMostExpensiveProducts = async (req: Request, res: Response) => {
  let limit = DEFAULT_PRODUCT_LIMIT;

  if (typeof req.query.limit === 'string') {
    limit = parseInt(req.query.limit, 10);
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    return res.status(400).json({ error: 'Limit must be a positive integer.' });
  }

  try {
    const mostExpensiveProducts = await dashboard.getMostExpensiveProducts(limit);
    res.status(200).json(mostExpensiveProducts);
  } catch (error) {
    console.error('getMostExpensiveProducts error', error);
    res.status(500).json({ error: `Failed to get the ${limit} most expensive products in descending order` });
  }
};

export default dashboard;
