import { type Request, type Response } from 'express';
import { OrderStore, type CreateOrderInput, type UpdateOrderInput } from '../models/order.ts';
import { isOrderStatus } from '../models/orderStatus.ts';

interface GetOrderRouteParams {
  id: string;
}

const store = new OrderStore();

// Get all orders
export const index = async (_req: Request, res: Response) => {
  try {
    const allOrders = await store.index();
    res.status(200).json(allOrders);
  } catch (error) {
    console.error('index error', error);
    res.status(500).json({ error: 'Unable to fetch orders' });
  }
};

// Get order by ID
export const getOrder = async (req: Request<GetOrderRouteParams>, res: Response) => {
  const { id } = req.params;
  try {
    const order = await store.show(id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('getOrder error', error);
    res.status(500).json({ error: 'Unable to fetch order' });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  const { status, userId }: CreateOrderInput = req.body;

  if (!isOrderStatus(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  try {
    const newOrder = await store.create({ status, userId });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('createOrder error', error);
    res.status(500).json({ error: 'Unable to create order' });
  }
};

// Update an existing order
export const updateOrder = async (req: Request<GetOrderRouteParams>, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as UpdateOrderInput;

  if (!isOrderStatus(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  try {
    const updatedOrder = await store.update(id, { status });
    if (!updatedOrder) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('updateOrder error', error);
    res.status(500).json({ error: 'Unable to update order' });
  }
};

export const deleteOrder = async (req: Request<GetOrderRouteParams>, res: Response) => {
  const { id } = req.params;

  try {
    const deleteResult = await store.hardDelete(id);
    if (!deleteResult) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('deleteOrder error', error);
    res.status(500).json({ error: 'Unable to delete order' });
  }
};

export const addProductToOrder = async (req: Request<GetOrderRouteParams>, res: Response) => {
  const orderId: string = req.params.id;
  const productId: string = req.body.productId;
  const quantity: number = parseInt(req.body.quantity, 10);

  if (!productId) {
    return res.status(400).json({ error: 'Missing productId in request body' });
  }

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  try {
    const orderProduct = await store.addProduct(quantity, orderId, productId);
    res.status(201).json(orderProduct);
  } catch (error) {
    console.error('addProductToOrder error', error);

    if (error instanceof Error && error.message.includes('non-active')) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Unable to add product to order' });
  }
};

export const removeProductFromOrder = async (req: Request<{ id: string; productId: string }>, res: Response) => {
  const { id: orderId, productId } = req.params;

  try {
    const removeResult = await store.removeProduct(orderId, productId);
    if (!removeResult) {
      return res.status(404).json({ error: 'Product not found in order' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('removeProductFromOrder error', error);
    res.status(500).json({ error: 'Unable to remove product from order' });
  }
};
