import { Client } from 'pg';

async function main(): Promise<void> {
  const dbName = process.env.POSTGRES_TEST_DB;
  if (!dbName) {
    throw new Error('POSTGRES_TEST_DB is not defined');
  }

  const client = new Client({
    host: process.env.POSTGRES_HOST ?? '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();

    // Drop database if it exists
    const dropQuery = `DROP DATABASE IF EXISTS "${dbName}"`;
    await client.query(dropQuery);
    console.log(`Dropped database ${dbName}`);

    // Create fresh database
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database ${dbName}`);
  } finally {
    await client.end();
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
