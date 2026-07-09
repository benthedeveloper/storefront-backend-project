import { type Request, type Response } from 'express';
import { DashboardQueries } from '../services/dashboard.ts';

const dashboard = new DashboardQueries();

export const productsInOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await dashboard.productsInOrders();
    res.json(products);
  } catch (error) {
    console.error('productsInOrders error', error);
    res.status(500).json({ error: 'Failed to fetch products in orders' });
  }
};

export default dashboard;
