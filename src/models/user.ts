import bcrypt from 'bcrypt';
import client from '../database.ts';
import { toCamelCase } from '../helpers/index.ts';

const pepper = process.env.BCRYPT_PASSWORD ?? '';
const saltRounds = Number(process.env.SALT_ROUNDS ?? 10);

export type CreateUserInput = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type UpdateUserInput = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

export type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
};

export class UserStore {
  // CREATE
  async create(u: CreateUserInput): Promise<User> {
    const conn = await client.connect();

    try {
      const hash = bcrypt.hashSync(`${u.password}${pepper}`, saltRounds);

      const sql = `
        INSERT INTO users (username, first_name, last_name, password_digest)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, first_name, last_name;
      `;

      const result = await conn.query(sql, [u.username, u.firstName, u.lastName, hash]);
      return toCamelCase(result.rows[0]) as User;
    } catch (error) {
      throw new Error(`Unable to create user ${u.username}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // AUTHENTICATE
  async authenticate(username: string, password: string): Promise<User | null> {
    const conn = await client.connect();

    try {
      const sql = `
      SELECT id, username, first_name, last_name, password_digest
      FROM users
      WHERE username = $1
      LIMIT 1
    `;

      const result = await conn.query(sql, [username]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];

      if (!bcrypt.compareSync(`${password}${pepper}`, user.password_digest)) {
        return null;
      }

      return toCamelCase(user) as User;
    } catch (error) {
      throw new Error(`Unable to authenticate user ${username}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // READ
  async index(): Promise<User[]> {
    const conn = await client.connect();
    try {
      const sql = `SELECT id, username, first_name, last_name FROM users`;
      const result = await conn.query(sql);
      return result.rows.map(toCamelCase) as User[];
    } catch (error) {
      throw new Error(`Cannot get users`, { cause: error });
    } finally {
      conn.release();
    }
  }

  async show(id: string): Promise<User> {
    const conn = await client.connect();
    try {
      const sql = `SELECT id, username, first_name, last_name FROM users WHERE id = $1`;
      const result = await conn.query(sql, [id]);
      return toCamelCase(result.rows[0]) as User;
    } catch (error) {
      throw new Error(`Cannot get user ${id}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // UPDATE
  async update(id: string, u: UpdateUserInput): Promise<User | null> {
    const conn = await client.connect();

    try {
      const fieldsToUpdate: string[] = [];
      const values: Array<string | number> = [];
      let parameterIndex = 1;

      if (u.username !== undefined) {
        fieldsToUpdate.push(`username = $${parameterIndex}`);
        values.push(u.username);
        parameterIndex += 1;
      }

      if (u.password !== undefined) {
        const hash = bcrypt.hashSync(`${u.password}${pepper}`, saltRounds);
        fieldsToUpdate.push(`password_digest = $${parameterIndex}`);
        values.push(hash);
        parameterIndex += 1;
      }

      if (u.firstName !== undefined) {
        fieldsToUpdate.push(`first_name = $${parameterIndex}`);
        values.push(u.firstName);
        parameterIndex += 1;
      }

      if (u.lastName !== undefined) {
        fieldsToUpdate.push(`last_name = $${parameterIndex}`);
        values.push(u.lastName);
        parameterIndex += 1;
      }

      if (fieldsToUpdate.length === 0) {
        return null;
      }

      values.push(id);

      const sql = `
        UPDATE users
        SET ${fieldsToUpdate.join(', ')}
        WHERE id = $${parameterIndex}
        RETURNING id, username, first_name, last_name;
      `;

      const result = await conn.query(sql, values);
      return result.rows.length > 0 ? (toCamelCase(result.rows[0]) as User) : null;
    } catch (error) {
      throw new Error(`Cannot update user ${id}`, { cause: error });
    } finally {
      conn.release();
    }
  }

  // DELETE
  async hardDelete(id: string): Promise<boolean> {
    const conn = await client.connect();
    try {
      const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id;
      `;

      const values = [id];
      const { rowCount } = await conn.query(query, values);

      // rowCount will be 0 if the ID did not exist
      return (rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error hard deleting user ${id}`, { cause: error });
    } finally {
      conn.release();
    }
  }
}
