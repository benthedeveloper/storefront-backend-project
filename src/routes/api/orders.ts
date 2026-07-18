import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.ts';
import {
  index,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  addProductToOrder,
  removeProductFromOrder,
} from '../../handlers/orders.ts';

// Orders API route handler
const orders = Router();

// Index route
orders.get('/', authenticateToken, index);

// Show route
orders.get<{ id: string }>('/:id', authenticateToken, getOrder);

// Create route - protected by authentication middleware
orders.post('/', authenticateToken, createOrder);

// Edit route - protected by authentication middleware
orders.put<{ id: string }>('/:id', authenticateToken, updateOrder);

// Delete route - protected by authentication middleware
orders.delete<{ id: string }>('/:id', authenticateToken, deleteOrder);

// Add product to an order - protected by authentication middleware
orders.post<{ id: string }>('/:id/products', authenticateToken, addProductToOrder);

// Remove product from an order - protected by authentication middleware
orders.delete<{ id: string; productId: string }>('/:id/products/:productId', authenticateToken, removeProductFromOrder);

export default orders;
