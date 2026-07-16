import { type Response } from 'express';
import { type PostgresError } from '../types/database.ts';

/**
 * Centrally handles 500 Server Errors, inspects database exceptions,
 * logs the trace, and sends a standardized JSON response.
 */
export const handleServerError = (
  res: Response,
  error: unknown,
  fallbackMessage: string = 'An unexpected database error occurred',
): Response => {
  // Log error to your server console for debugging
  console.error(`[Error] ${fallbackMessage}:`, error);

  let detailMessage = fallbackMessage;

  // Safely extract Postgres details if they exist on the 'cause'
  if (error instanceof Error) {
    const dbError = error.cause as PostgresError | undefined;
    if (dbError) {
      detailMessage = dbError.detail || dbError.message || detailMessage;
    }
  }

  // Return the standard error response format
  return res.status(500).json({
    error: fallbackMessage,
    detail: detailMessage,
  });
};
