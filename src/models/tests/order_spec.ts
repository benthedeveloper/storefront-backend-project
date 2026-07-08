import { type Order, type CreateOrderInput, OrderStore } from '../order.ts';
import { type User, type CreateUserInput, UserStore } from '../user.ts';
import { ProductStore, type Product } from '../product.ts';

const store = new OrderStore();
const userStore = new UserStore();
const productStore = new ProductStore();
const testOrderToCreate: Omit<CreateOrderInput, 'userId'> = {
  status: 'active',
};

const createTestUser = async (): Promise<User> => {
  const testUserToCreate: CreateUserInput = {
    username: `order_test_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    password: 'testPassword',
    firstName: 'Test',
    lastName: 'User',
  };

  return userStore.create(testUserToCreate);
};

const createTestProduct = async (): Promise<Product> => {
  const testProductToCreate = {
    name: `Test product ${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    price: 10.99,
  };

  return productStore.create(testProductToCreate);
};

describe('Order Model', () => {
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

  describe('create order tests', () => {
    it('create method should add a order', async () => {
      const user = await createTestUser();
      let result: Order | null = null;

      try {
        result = await store.create({ ...testOrderToCreate, userId: user.id });
        expect(result.status).toEqual(testOrderToCreate.status);
        expect(result.userId).toEqual(user.id);
        expect(result.id).toBeGreaterThanOrEqual(1);
      } finally {
        if (result) {
          await store.hardDelete(String(result.id));
        }
        await userStore.hardDelete(String(user.id));
      }
    });
  });

  describe('read order tests', () => {
    let testUser: User;
    let testOrder: Order;

    beforeAll(async () => {
      testUser = await createTestUser();
      testOrder = await store.create({ ...testOrderToCreate, userId: testUser.id });
    });

    afterAll(async () => {
      await store.hardDelete(String(testOrder.id));
      await userStore.hardDelete(String(testUser.id));
    });

    it('index method should return a list of orders', async () => {
      const result = await store.index();
      expect(result.length).toBeGreaterThan(0);
    });

    it('show method should return the correct order', async () => {
      const result = await store.show(String(testOrder.id));
      expect(result).toEqual(testOrder);
    });
  });

  describe('update order tests', () => {
    let testUser: User;
    let alternateUser: User;
    let testOrder: Order;

    beforeAll(async () => {
      testUser = await createTestUser();
      alternateUser = await createTestUser();
      testOrder = await store.create({ ...testOrderToCreate, userId: testUser.id });
    });

    afterAll(async () => {
      await store.hardDelete(String(testOrder.id));
      await userStore.hardDelete(String(testUser.id));
      await userStore.hardDelete(String(alternateUser.id));
    });

    it('update method should update the order', async () => {
      const result = await store.update(String(testOrder.id), {
        status: 'completed',
        userId: alternateUser.id,
      });
      expect(result).toEqual(
        jasmine.objectContaining({
          id: testOrder.id,
          status: 'completed',
          userId: alternateUser.id,
        }),
      );
    });
  });

  describe('delete order tests', () => {
    let testUser: User;
    let testOrder: Order;

    beforeAll(async () => {
      testUser = await createTestUser();
      testOrder = await store.create({ ...testOrderToCreate, userId: testUser.id });
    });

    afterAll(async () => {
      await userStore.hardDelete(String(testUser.id));
    });

    it('hardDelete method should delete the order', async () => {
      const result = await store.hardDelete(String(testOrder.id));
      expect(result).toBe(true);
    });
  });

  describe('add product to order tests', () => {
    let testUser: User;
    let testOrder: Order;
    let testProduct: Product;

    beforeAll(async () => {
      testUser = await createTestUser();
      testOrder = await store.create({ ...testOrderToCreate, userId: testUser.id });
      testProduct = await createTestProduct();
    });

    afterAll(async () => {
      await store.removeProduct(String(testOrder.id), String(testProduct.id));
      await store.hardDelete(String(testOrder.id));
      await userStore.hardDelete(String(testUser.id));
      await productStore.hardDelete(String(testProduct.id));
    });

    it('addProduct method should add a product to the order', async () => {
      const quantity = 2;
      const result = await store.addProduct(quantity, String(testOrder.id), String(testProduct.id));
      expect(result).toEqual(
        jasmine.objectContaining({
          quantity,
          orderId: testOrder.id,
          productId: testProduct.id,
        }),
      );
    });

    it('addProduct method should reject products for non-active orders', async () => {
      const closedOrder = await store.create({ status: 'completed', userId: testUser.id });
      const closedProduct = await createTestProduct();

      try {
        await store.addProduct(1, String(closedOrder.id), String(closedProduct.id));
        fail('Expected addProduct to reject closed orders');
      } catch (error) {
        expect(error).toEqual(jasmine.any(Error));
        expect((error as Error).message).toContain('active');
      } finally {
        await store.hardDelete(String(closedOrder.id));
        await productStore.hardDelete(String(closedProduct.id));
      }
    });
  });

  describe('remove product from order tests', () => {
    let testUser: User;
    let testOrder: Order;
    let testProduct: Product;

    beforeAll(async () => {
      testUser = await createTestUser();
      testOrder = await store.create({ ...testOrderToCreate, userId: testUser.id });
      testProduct = await createTestProduct();
      await store.addProduct(2, String(testOrder.id), String(testProduct.id));
    });

    afterAll(async () => {
      await store.removeProduct(String(testOrder.id), String(testProduct.id));
      await store.hardDelete(String(testOrder.id));
      await userStore.hardDelete(String(testUser.id));
      await productStore.hardDelete(String(testProduct.id));
    });

    it('removeProduct method should remove a product from the order', async () => {
      const result = await store.removeProduct(String(testOrder.id), String(testProduct.id));
      expect(result).toBe(true);
    });
  });
});
