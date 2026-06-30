import { type Book, BookStore } from '../book.ts';

const store = new BookStore();

describe('Book Model', () => {
  it('should have an index method', () => {
    expect(store.index).toBeDefined();
  });

  it('index method should return a list of books', async () => {
    const result = await store.index();
    expect(result).toEqual([]);
  });
});
