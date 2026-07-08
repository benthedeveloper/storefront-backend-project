import client from '../database.ts';
import { toCamelCase } from '../helpers/index.ts';

export type Order = {
  id: number;
  status: string;
  userId: number;
};

export type CreateOrderInput = Omit<Order, 'id'>;

export type UpdateOrderInput = {
  status?: string;
  userId?: number;
};

export type OrderProduct = {
  id: number;
  quantity: number;
  orderId: number;
  productId: number;
};

const mapOrder = (row: Record<string, unknown>): Order => {
  const order = toCamelCase(row) as Record<string, unknown>;

  return {
    id: Number(order.id),
    status: String(order.status),
    userId: Number(order.userId),
  };
};

const mapOrderProduct = (row: Record<string, unknown>): OrderProduct => {
  const product = toCamelCase(row) as Record<string, unknown>;

  return {
    id: Number(product.id),
    quantity: Number(product.quantity),
    orderId: Number(product.orderId),
    productId: Number(product.productId),
  };
};

export class OrderStore {
  // CREATE
  async create(newOrder: CreateOrderInput): Promise<Order> {
    const conn = await client.connect();
    try {
      const sql = `
        INSERT INTO orders (status, user_id) 
        VALUES ($1, $2) 
        RETURNING *;
      `;
      const values = [newOrder.status, newOrder.userId];
      const { rows } = await conn.query(sql, values);
      return mapOrder(rows[0]);
    } catch (error) {
      throw new Error(`Error creating order`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // READ
  // Get all orders
  async index(): Promise<Order[]> {
    const conn = await client.connect();
    try {
      const sql = 'SELECT * FROM orders';
      const result = await conn.query(sql);
      return result.rows.map((row) => mapOrder(row));
    } catch (error) {
      throw new Error(`Cannot get orders`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // Get order by id
  async show(id: string): Promise<Order> {
    const conn = await client.connect();
    try {
      const sql = 'SELECT * FROM orders WHERE id=($1)';
      const result = await conn.query(sql, [id]);
      return mapOrder(result.rows[0]);
    } catch (err) {
      throw new Error(`Could not find order ${id}`, { cause: err });
    } finally {
      conn.release();
    }
  }

  // UPDATE
  async update(id: string, order: UpdateOrderInput): Promise<Order | null> {
    const conn = await client.connect();

    try {
      const fieldsToUpdate: string[] = [];
      const values: Array<string | number> = [];
      let parameterIndex = 1;

      if (order.status !== undefined) {
        fieldsToUpdate.push(`status = $${parameterIndex}`);
        values.push(order.status);
        parameterIndex += 1;
      }

      if (order.userId !== undefined) {
        fieldsToUpdate.push(`user_id = $${parameterIndex}`);
        values.push(order.userId);
        parameterIndex += 1;
      }

      if (fieldsToUpdate.length === 0) {
        return null;
      }

      values.push(id);

      const sql = `
        UPDATE orders
        SET ${fieldsToUpdate.join(', ')}
        WHERE id = $${parameterIndex}
        RETURNING id, status, user_id;
      `;

      const result = await conn.query(sql, values);
      return result.rows.length > 0 ? mapOrder(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Error updating order ${id}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // DELETE
  async hardDelete(id: string): Promise<boolean> {
    const conn = await client.connect();
    try {
      const query = `
        DELETE FROM orders
        WHERE id = $1
        RETURNING id;
      `;

      const values = [id];
      const { rowCount } = await conn.query(query, values);

      // rowCount will be 0 if the ID did not exist
      return (rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error hard deleting order ${id}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // Add a product to an order
  async addProduct(quantity: number, orderId: string, productId: string): Promise<OrderProduct> {
    const conn = await client.connect();
    try {
      const orderResult = await conn.query('SELECT status FROM orders WHERE id = $1', [orderId]);

      if (orderResult.rows.length === 0) {
        throw new Error(`Order ${orderId} not found`);
      }

      const status = String(orderResult.rows[0].status).toLowerCase();
      if (status !== 'active') {
        throw new Error(`Cannot add product to a non-active order (${status})`);
      }

      const sql = `
        INSERT INTO order_products (quantity, order_id, product_id)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const values = [quantity, orderId, productId];
      const result = await conn.query(sql, values);
      return mapOrderProduct(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Cannot add product')) {
        throw error;
      }
      throw new Error(`Could not add product ${productId} to order ${orderId}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // Remove a product from an order
  async removeProduct(orderId: string, productId: string): Promise<boolean> {
    const conn = await client.connect();
    try {
      const query = `
        DELETE FROM order_products
        WHERE order_id = $1 AND product_id = $2
        RETURNING id;
      `;
      const { rowCount } = await conn.query(query, [orderId, productId]);
      return (rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error removing product from order`, { cause: error });
    } finally {
      conn.release();
    }
  }
}
