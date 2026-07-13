import { type Request, type Response } from 'express';
import { ProductStore, type CreateProductInput, type UpdateProductInput } from '../models/product.ts';

interface GetProductRouteParams {
  id: string;
}

const store = new ProductStore();

// Get all products
export const index = async (_req: Request, res: Response) => {
  try {
    const allProducts = await store.index();
    res.status(200).json(allProducts);
  } catch (error) {
    console.error('index error', error);
    res.status(500).json({ error: 'Unable to fetch products' });
  }
};

// Get product by ID
export const getProduct = async (req: Request<GetProductRouteParams>, res: Response) => {
  const { id } = req.params;
  try {
    const product = await store.show(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('getProduct error', error);
    res.status(500).json({ error: 'Unable to fetch product' });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  const { name, price }: CreateProductInput = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (typeof name !== 'string') {
    res.status(400).json({ error: 'Invalid name' });
    return;
  }

  if (typeof price !== 'number' || price <= 0) {
    res.status(400).json({ error: 'Invalid price' });
    return;
  }

  try {
    const newProduct = await store.create({ name, price });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('createProduct error', error);
    res.status(500).json({ error: 'Unable to create product' });
  }
};

// Update an existing product
export const updateProduct = async (req: Request<GetProductRouteParams>, res: Response) => {
  const { id } = req.params;
  const { name, price } = req.body as UpdateProductInput;

  if (typeof name !== 'string') {
    res.status(400).json({ error: 'Invalid name' });
    return;
  }

  if (typeof price !== 'number' || price <= 0) {
    res.status(400).json({ error: 'Invalid price' });
    return;
  }

  try {
    const updatedProduct = await store.update(id, { name, price });
    if (!updatedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('updateProduct error', error);
    res.status(500).json({ error: 'Unable to update product' });
  }
};

export const deleteProduct = async (req: Request<GetProductRouteParams>, res: Response) => {
  const { id } = req.params;

  try {
    const deleteResult = await store.hardDelete(id);
    if (!deleteResult) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('deleteProduct error', error);
    res.status(500).json({ error: 'Unable to delete product' });
  }
};
