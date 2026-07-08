import { type Product, type CreateProductInput, type UpdateProductInput, ProductStore } from '../product.ts';

const store = new ProductStore();
const testProductToCreate: CreateProductInput = {
  name: 'Test product',
  price: 10.99,
};

describe('Product Model', () => {
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

  describe('create product tests', () => {
    it('create method should add a product', async () => {
      const result = await store.create(testProductToCreate);
      try {
        expect(result.name).toEqual(testProductToCreate.name);
        expect(typeof result.price).toBe('number');
        expect(result.price).toEqual(testProductToCreate.price);
        expect(result.id).toBeGreaterThanOrEqual(1);
      } finally {
        await store.hardDelete(String(result.id));
      }
    });
  });

  describe('read product tests', () => {
    let testProduct: Product;

    beforeAll(async () => {
      testProduct = await store.create(testProductToCreate);
    });

    afterAll(async () => {
      await store.hardDelete(String(testProduct.id));
    });

    it('index method should return a list of products', async () => {
      const result = await store.index();
      expect(result.length).toBeGreaterThan(0);
    });

    it('show method should return the correct product', async () => {
      const result = await store.show(String(testProduct.id));
      expect(result).toEqual(testProduct);
    });
  });

  describe('update product tests', () => {
    let testProduct: Product;

    beforeAll(async () => {
      testProduct = await store.create(testProductToCreate);
    });

    afterAll(async () => {
      await store.hardDelete(String(testProduct.id));
    });

    it('update method should update the product', async () => {
      const result = await store.update(String(testProduct.id), {
        name: 'Updated Test product',
        price: 11.5,
      });
      expect(result).toEqual(
        jasmine.objectContaining({
          id: testProduct.id,
          name: 'Updated Test product',
          price: 11.5,
        }),
      );
      expect(typeof result?.price).toBe('number');
    });
  });

  describe('invalid input tests', () => {
    it('create method should reject negative prices', async () => {
      await expectAsync(store.create({ ...testProductToCreate, price: -1 })).toBeRejected();
    });

    it('create method should reject non-numeric prices', async () => {
      await expectAsync(store.create({ ...testProductToCreate, price: 'abc' as unknown as number })).toBeRejected();
    });

    it('create method should reject prices with more than two decimals', async () => {
      await expectAsync(store.create({ ...testProductToCreate, price: 10.999 })).toBeRejected();
    });

    it('update method should reject invalid prices', async () => {
      const product = await store.create(testProductToCreate);
      try {
        await expectAsync(
          store.update(String(product.id), { price: -1 } as unknown as UpdateProductInput),
        ).toBeRejected();
      } finally {
        await store.hardDelete(String(product.id));
      }
    });
  });

  describe('delete product tests', () => {
    let testProduct: Product;

    beforeAll(async () => {
      testProduct = await store.create(testProductToCreate);
    });

    it('hardDelete method should delete the product', async () => {
      const result = await store.hardDelete(String(testProduct.id));
      expect(result).toBe(true);
    });
  });
});
