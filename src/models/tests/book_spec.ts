import { type Book, type CreateBookInput, BookStore } from '../book.ts';

const store = new BookStore();
const testBookToCreate: CreateBookInput = {
  title: 'Test Book',
  author: 'Test Author',
  totalPages: 100,
  summary: 'Test Summary',
};

describe('Book Model', () => {
  describe('Methods exist', () => {
    it('should have a create method', () => {
      expect(store.create).toBeDefined();
    });

    it('should have an index method', () => {
      expect(store.index).toBeDefined();
    });

    it('should have a show method', () => {
      expect(store.show).toBeDefined();
    });

    it('should have an update method', () => {
      expect(store.update).toBeDefined();
    });

    it('should have a hardDelete method', () => {
      expect(store.hardDelete).toBeDefined();
    });
  });

  describe('create book tests', () => {
    it('create method should add a book', async () => {
      const result = await store.create(testBookToCreate);
      try {
        expect(result.title).toEqual(testBookToCreate.title);
        expect(result.author).toEqual(testBookToCreate.author);
        expect(result.totalPages).toEqual(testBookToCreate.totalPages);
        expect(result.summary).toEqual(testBookToCreate.summary);
        expect(result.id).toBeGreaterThanOrEqual(1);
      } finally {
        await store.hardDelete(String(result.id));
      }
    });
  });

  describe('read book tests', () => {
    let testBook: Book;

    beforeAll(async () => {
      testBook = await store.create(testBookToCreate);
    });

    afterAll(async () => {
      await store.hardDelete(String(testBook.id));
    });

    it('index method should return a list of books', async () => {
      const result = await store.index();
      expect(result.length).toBeGreaterThan(0);
    });

    it('show method should return the correct book', async () => {
      const result = await store.show(String(testBook.id));
      expect(result).toEqual(testBook);
    });
  });

  describe('update book tests', () => {
    let testBook: Book;

    beforeAll(async () => {
      testBook = await store.create(testBookToCreate);
    });

    afterAll(async () => {
      await store.hardDelete(String(testBook.id));
    });

    it('update method should update the book', async () => {
      const result = await store.update(String(testBook.id), {
        title: 'Updated Test Book',
        author: 'Updated Test Author',
        totalPages: 150,
        summary: 'Updated Test Summary',
      });
      expect(result).toEqual(
        jasmine.objectContaining({
          id: testBook.id,
          title: 'Updated Test Book',
        }),
      );
    });
  });

  describe('delete book tests', () => {
    let testBook: Book;

    beforeAll(async () => {
      testBook = await store.create(testBookToCreate);
    });

    it('hardDelete method should delete the book', async () => {
      const result = await store.hardDelete(String(testBook.id));
      expect(result).toBe(true);
    });
  });
});
