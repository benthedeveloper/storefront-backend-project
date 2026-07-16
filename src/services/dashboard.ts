import client from '../database.ts';
import { toCamelCase } from '../helpers/caseConverters.ts';
import { type Product, mapProduct } from '../models/product.ts';
import { type User } from '../models/user.ts';

const mapProductInOrder = (row: Record<string, unknown>): { name: string; price: number; orderId: string } => {
  const productInOrder = toCamelCase(row) as Record<string, unknown>;

  return {
    name: String(productInOrder.name),
    price: Number(productInOrder.price),
    orderId: String(productInOrder.orderId),
  };
};

const isNumItemsValid = (numItems: number, itemType: string): boolean => {
  if (!Number.isInteger(numItems) || numItems <= 0) {
    throw new Error(`${itemType} count must be a positive integer`);
  }

  return true;
};

// READ-ONLY queries for the dashboard
export class DashboardQueries {
  // Get all products that have been included in orders
  async productsInOrders(): Promise<{ name: string; price: number; orderId: string }[]> {
    const conn = await client.connect();
    try {
      const sql = `
        SELECT products.name, products.price, order_products.order_id
        FROM products
        INNER JOIN order_products ON products.id = order_products.product_id
      `;
      const result = await conn.query(sql);

      return result.rows.map(mapProductInOrder);
    } catch (error) {
      throw new Error(`Error getting all products that have been included in orders`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // Get all users that have made orders
  async usersWithOrders(): Promise<User[]> {
    const conn = await client.connect();
    try {
      const sql = `
        SELECT users.id, users.username, users.first_name, users.last_name
        FROM users
        INNER JOIN orders ON users.id = orders.user_id
      `;

      const result = await conn.query(sql);
      return result.rows.map(toCamelCase) as User[];
    } catch (error) {
      throw new Error(`Cannot get all users with orders`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // Get the N most expensive products, sorted from most-to-least expensive
  async getMostExpensiveProducts(numProducts: number): Promise<Product[]> {
    if (!isNumItemsValid(numProducts, 'Product')) {
      throw new Error(`Invalid number of products: ${numProducts}`);
    }

    const conn = await client.connect();
    try {
      const sql = `
        SELECT *
        FROM products
        ORDER BY price DESC
        LIMIT $1
      `;
      const values = [numProducts];
      const { rows } = await conn.query(sql, values);
      return rows.map((row) => mapProduct(row));
    } catch (error) {
      throw new Error(`Error getting the ${numProducts} most expensive products`, { cause: error });
    } finally {
      conn.release();
    }
  }
}
