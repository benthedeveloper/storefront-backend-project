import { type Request, type Response } from 'express';
import { BookStore, type CreateBookInput, type UpdateBookInput } from '../models/book.ts';

interface BookRouteParams {
  id: string;
}

const store = new BookStore();

// Get all books
export const index = async (_req: Request, res: Response) => {
  try {
    const allBooks = await store.index();
    res.status(200).json(allBooks);
  } catch (error) {
    console.error('index error', error);
    res.status(500).json({ error: 'Unable to fetch books' });
  }
};

// Get book by ID
export const getBook = async (req: Request<BookRouteParams>, res: Response) => {
  const { id } = req.params;
  try {
    const foundBook = await store.show(id);
    if (!foundBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json(foundBook);
  } catch (error) {
    console.error('getBookById error', error);
    res.status(500).json({ error: 'Unable to fetch book' });
  }
};

// Create a new book
export const createBook = async (req: Request, res: Response) => {
  const { title, author, totalPages, summary }: CreateBookInput = req.body;
  if (!title || !author || !totalPages || !summary) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const payload = { title, author, totalPages, summary };

  try {
    const createdBook = await store.create(payload);
    res.status(201).json(createdBook);
  } catch (error) {
    console.error('createBook error', error);
    res.status(500).json({ error: 'Unable to create book' });
  }
};

// Update a book by ID
export const updateBook = async (req: Request<BookRouteParams>, res: Response) => {
  const { id } = req.params;
  const { title, author, totalPages, summary }: UpdateBookInput = req.body;
  if (!title && !author && !totalPages && !summary) {
    return res.status(400).json({ error: 'Missing a field to update' });
  }

  const payload = { title, author, totalPages, summary };

  try {
    const updatedBook = await store.update(id, payload);
    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    console.error('updateBook error', error);
    res.status(500).json({ error: 'Unable to update book' });
  }
};

// Delete a book
export const deleteBook = async (req: Request<BookRouteParams>, res: Response) => {
  const { id } = req.params;

  try {
    const deleteResult = await store.hardDelete(id);
    if (!deleteResult) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('deleteBook error', error);
    res.status(500).json({ error: 'Unable to delete book' });
  }
};
