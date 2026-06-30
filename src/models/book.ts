import client from '../database.ts';

export type Book = {
  id: number;
  title: string;
  author: string;
  totalPages: number;
  summary: string;
};

export class BookStore {
  // CREATE
  async create(newBook: Book): Promise<Book> {
    try {
      const conn = await client.connect();
      const sql = `
    INSERT INTO books (title, author, totalPages, summary) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *;
  `;
      // const result = await conn.query(sql);
      const values = [newBook.title, newBook.author, newBook.totalPages, newBook.summary];
      const { rows } = await conn.query(sql, values);
      conn.release();
      return rows[0];
    } catch (error) {
      throw new Error(`Cannot create book: ${error}`);
    }
  }

  // READ
  // Get all books
  async index(): Promise<Book[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM books';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (error) {
      throw new Error(`Cannot get books: ${error}`);
    }
  }

  // Get book by id
  async show(id: string): Promise<Book> {
    try {
      const sql = 'SELECT * FROM books WHERE id=($1)';
      const conn = await client.connect();

      const result = await conn.query(sql, [id]);

      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find book ${id}. Error: ${err}`);
    }
  }

  // UPDATE
  async update(id: string, book: Book): Promise<Book | null> {
    try {
      const conn = await client.connect();
      const keys = Object.keys(book);

      // Handle empty update payloads
      if (keys.length === 0) {
        throw new Error('No fields provided for update');
      }

      // Dynamically build the SET clause mapping camelCase to snake_case if needed
      const setParts: string[] = [];
      const values: any[] = [];

      keys.forEach((key, index) => {
        // Convert camelCase field to snake_case for Postgres columns
        const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();

        // $1, $2, etc. (index + 1 because SQL parameters are 1-indexed)
        setParts.push(`${columnName} = $${index + 1}`);
        values.push((book as any)[key]);
      });

      // Add the ID as the final query parameter
      const idParamIndex = values.length + 1;
      values.push(id);

      // Construct the final query string
      const query = `
    UPDATE books
    WHERE id = $${idParamIndex}
    RETURNING *;
  `;

      const { rows } = await conn.query(query, values);

      // Return the updated row, or null if the book didn't exist
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating book: ${error}`);
    }
  }

  // DELETE
  async hardDelete(id: string): Promise<boolean> {
    try {
      const conn = await client.connect();
      const query = `
        DELETE FROM books
        WHERE id = $1
        RETURNING id;
      `;

      const values = [id];
      const { rowCount, rows } = await conn.query(query, values);

      // rowCount will be 0 if the ID did not exist
      return (rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error hard deleting book: ${error}`);
    }
  }
}
