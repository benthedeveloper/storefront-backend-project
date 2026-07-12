import client from '../database.ts';
import { toCamelCase } from '../helpers/index.ts';

export type Product = {
  id: number;
  name: string;
  price: number;
};

export type CreateProductInput = Omit<Product, 'id'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export const mapProduct = (row: Record<string, unknown>): Product => {
  const product = toCamelCase(row) as Record<string, unknown>;

  return {
    id: Number(product.id),
    name: String(product.name),
    price: Number(product.price),
  };
};

const validateProductInput = (product: Partial<CreateProductInput>, context: string): void => {
  if (product.price !== undefined) {
    const price = product.price;

    if (typeof price !== 'number' || !Number.isFinite(price)) {
      throw new Error(`${context} requires a numeric price`);
    }

    if (price < 0) {
      throw new Error(`${context} requires a non-negative price`);
    }

    const decimalPlaces = (price.toString().split('.')[1] ?? '').length;
    if (decimalPlaces > 2) {
      throw new Error(`${context} requires at most two decimal places`);
    }
  }
};

export class ProductStore {
  // CREATE
  async create(newProduct: CreateProductInput): Promise<Product> {
    validateProductInput(newProduct, 'Product creation');

    const conn = await client.connect();
    try {
      const sql = `
        INSERT INTO products (name, price) 
        VALUES ($1, $2) 
        RETURNING *;
      `;
      const values = [newProduct.name, newProduct.price];
      const { rows } = await conn.query(sql, values);
      return mapProduct(rows[0]);
    } catch (error) {
      throw new Error(`Error creating product`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // READ
  // Get all products
  async index(): Promise<Product[]> {
    const conn = await client.connect();
    try {
      const sql = 'SELECT * FROM products';
      const result = await conn.query(sql);
      return result.rows.map((row) => mapProduct(row));
    } catch (error) {
      throw new Error(`Cannot get products`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // Get product by id
  async show(id: string): Promise<Product | null> {
    const conn = await client.connect();
    try {
      const sql = 'SELECT * FROM products WHERE id=($1)';
      const result = await conn.query(sql, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return mapProduct(result.rows[0]);
    } catch (err) {
      throw new Error(`Could not find product ${id}`, { cause: err });
    } finally {
      conn.release();
    }
  }

  // UPDATE
  async update(id: string, product: UpdateProductInput): Promise<Product | null> {
    validateProductInput(product, 'Product update');

    const conn = await client.connect();
    try {
      const keys = Object.keys(product);

      // Handle empty update payloads
      if (keys.length === 0) {
        throw new Error('No fields provided for update');
      }

      // Dynamically build the SET clause mapping camelCase to snake_case if needed
      const setParts: string[] = [];
      const values: Array<string | number> = [];

      keys.forEach((key, index) => {
        // Convert camelCase field to snake_case for Postgres columns
        const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();

        // $1, $2, etc. (index + 1 because SQL parameters are 1-indexed)
        setParts.push(`${columnName} = $${index + 1}`);
        const value = (product as Record<string, string | number | undefined>)[key];
        if (value === undefined) {
          throw new Error(`Invalid value for update field ${key}`);
        }
        values.push(value);
      });

      // Add the ID as the final query parameter
      const idParamIndex = values.length + 1;
      values.push(id);

      // Construct the final query string
      const query = `
        UPDATE products
        SET ${setParts.join(', ')}
        WHERE id = $${idParamIndex}
        RETURNING *;
        `;

      const { rows } = await conn.query(query, values);

      // Return the updated row, or null if the product didn't exist
      return rows[0] ? mapProduct(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error updating product ${id}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // DELETE
  async hardDelete(id: string): Promise<boolean> {
    const conn = await client.connect();
    try {
      const query = `
        DELETE FROM products
        WHERE id = $1
        RETURNING id;
      `;

      const values = [id];
      const { rowCount } = await conn.query(query, values);

      // rowCount will be 0 if the ID did not exist
      return (rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error hard deleting product ${id}`, { cause: error });
    } finally {
      conn.release();
    }
  }
}
