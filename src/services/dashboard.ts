import client from '../database.ts';
import { toCamelCase } from '../helpers/caseConverters.ts';

const mapProductInOrder = (row: Record<string, unknown>): { name: string; price: number; orderId: string } => {
  const productInOrder = toCamelCase(row) as Record<string, unknown>;

  return {
    name: String(productInOrder.name),
    price: Number(productInOrder.price),
    orderId: String(productInOrder.orderId),
  };
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
}
