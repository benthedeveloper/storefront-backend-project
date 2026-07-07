import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.ts';
import { index, getBook, createBook, updateBook, deleteBook } from '../../handlers/books.ts';

const books = Router();

// Index route
books.get('/', index);

// Show route
books.get('/:id', getBook);

// Create route - protected by authentication middleware
books.post('/', authenticateToken, createBook);

// Edit route - protected by authentication middleware
books.put<{ id: string }>('/:id', authenticateToken, updateBook);

// Delete route - protected by authentication middleware
books.delete<{ id: string }>('/:id', authenticateToken, deleteBook);

export default books;
