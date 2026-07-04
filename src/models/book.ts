import client from '../database.ts';
import { toCamelCase } from '../helpers/index.ts';

export type Book = {
  id: number;
  title: string;
  author: string;
  totalPages: number;
  summary: string;
};

export type CreateBookInput = Omit<Book, 'id'>;
export type UpdateBookInput = Omit<Book, 'id'>;

export class BookStore {
  // CREATE
  async create(newBook: CreateBookInput): Promise<Book> {
    const conn = await client.connect();
    try {
      const sql = `
        INSERT INTO books (title, author, total_pages, summary) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
      `;
      const values = [newBook.title, newBook.author, newBook.totalPages, newBook.summary];
      const { rows } = await conn.query(sql, values);
      return toCamelCase(rows[0]) as Book;
    } catch (error) {
      throw new Error(`Cannot create book ${newBook.title}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // READ
  // Get all books
  async index(): Promise<Book[]> {
    const conn = await client.connect();
    try {
      const sql = 'SELECT * FROM books';
      const result = await conn.query(sql);
      return result.rows.map(toCamelCase) as Book[];
    } catch (error) {
      throw new Error(`Cannot get books`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // Get book by id
  async show(id: string): Promise<Book> {
    const conn = await client.connect();
    try {
      const sql = 'SELECT * FROM books WHERE id=($1)';
      const result = await conn.query(sql, [id]);
      return toCamelCase(result.rows[0]) as Book;
    } catch (err) {
      throw new Error(`Could not find book ${id}`, { cause: err });
    } finally {
      conn.release();
    }
  }

  // UPDATE
  async update(id: string, book: UpdateBookInput): Promise<Book | null> {
    const conn = await client.connect();
    try {
      const keys = Object.keys(book);

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
        const value = (book as Record<string, string | number | undefined>)[key];
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
        UPDATE books
        SET ${setParts.join(', ')}
        WHERE id = $${idParamIndex}
        RETURNING *;
        `;

      const { rows } = await conn.query(query, values);

      // Return the updated row, or null if the book didn't exist
      return rows[0] ? (toCamelCase(rows[0]) as Book) : null;
    } catch (error) {
      throw new Error(`Error updating book ${id}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // DELETE
  async hardDelete(id: string): Promise<boolean> {
    const conn = await client.connect();
    try {
      const query = `
        DELETE FROM books
        WHERE id = $1
        RETURNING id;
      `;

      const values = [id];
      const { rowCount } = await conn.query(query, values);

      // rowCount will be 0 if the ID did not exist
      return (rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error hard deleting book ${id}`, { cause: error });
    } finally {
      conn.release();
    }
  }
}
