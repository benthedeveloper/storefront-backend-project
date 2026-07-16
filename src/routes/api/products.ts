import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.ts';
import { index, getProduct, createProduct, updateProduct, deleteProduct } from '../../handlers/products.ts';

const products = Router();

// Index route
products.get('/', index);

// Show route
products.get('/:id', getProduct);

// Create route - protected by authentication middleware
products.post('/', authenticateToken, createProduct);

// Edit route - protected by authentication middleware
products.put<{ id: string }>('/:id', authenticateToken, updateProduct);

// Delete route - protected by authentication middleware
products.delete<{ id: string }>('/:id', authenticateToken, deleteProduct);

export default products;
