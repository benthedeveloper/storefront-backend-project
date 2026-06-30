import { type Book, type CreateBookInput, BookStore } from '../book.ts';

const store = new BookStore();

describe('Book Model', () => {
  describe('create book tests', () => {
    it('should have a create method', () => {
      expect(store.create).toBeDefined();
    });

    it('create method should add a book', async () => {
      const result = await store.create({
        title: 'Test Book',
        author: 'Test Author',
        totalPages: 100,
        summary: 'Test Summary',
      });
      expect(result).toEqual({
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        totalPages: 100,
        summary: 'Test Summary',
      });
    });
  });

  describe('read book tests', () => {
    it('should have an index method', () => {
      expect(store.index).toBeDefined();
    });

    it('index method should return a list of books', async () => {
      const result = await store.index();
      expect(result).toEqual([]);
    });

    it('should have a show method', () => {
      expect(store.show).toBeDefined();
    });

    it('show method should return the correct book', async () => {
      const result = await store.show('1');
      expect(result).toEqual({
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        totalPages: 100,
        summary: 'Test Summary',
      });
    });
  });

  describe('update book tests', () => {
    it('should have an update method', () => {
      expect(store.update).toBeDefined();
    });

    it('update method should update the book', async () => {
      const result = await store.update('1', {
        title: 'Updated Test Book',
        author: 'Updated Test Author',
        totalPages: 150,
        summary: 'Updated Test Summary',
      });
      expect(result).toEqual({
        id: 1,
        title: 'Updated Test Book',
        author: 'Updated Test Author',
        totalPages: 150,
        summary: 'Updated Test Summary',
      });
    });
  });

  describe('delete book tests', () => {
    it('should have a hardDelete method', () => {
      expect(store.hardDelete).toBeDefined();
    });

    it('hardDelete method should delete the book', async () => {
      const result = await store.hardDelete('1');
      expect(result).toBe(true);
      expect(await store.index()).toEqual([]);
    });
  });
});
