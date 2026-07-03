import { Router } from 'express';
import { index, getBook, createBook, updateBook, deleteBook } from '../../handlers/books.ts';

const books = Router();

// Index route
books.get('/', index);

// Show route
books.get('/:id', getBook);

// Create route
books.post('/', createBook);

// Edit route
books.put('/:id', updateBook);

// Delete route
books.delete('/:id', deleteBook);

export default books;
