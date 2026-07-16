import { DatabaseError } from 'pg';

/**
 * Custom Postgres Error type extending pg's native DatabaseError.
 */
export type PostgresError = DatabaseError;
