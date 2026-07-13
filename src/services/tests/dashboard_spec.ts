import { DashboardQueries } from '../dashboard.ts';
import { OrderStore } from '../../models/order.ts';
import { ProductStore, type Product } from '../../models/product.ts';
import { UserStore, type CreateUserInput, type User } from '../../models/user.ts';

// Tests for dashboard queries
describe('DashboardQueries', () => {
  let dashboardQueries: DashboardQueries;
  let userStore: UserStore;
  let orderStore: OrderStore;
  let productStore: ProductStore;
  let testUser: User;
  let testProduct: Product;
  let higherPriceProduct: Product;
  let testOrderId: number;

  beforeAll(async () => {
    dashboardQueries = new DashboardQueries();
    userStore = new UserStore();
    orderStore = new OrderStore();
    productStore = new ProductStore();

    const testUserToCreate: CreateUserInput = {
      username: `dashboard_test_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      password: 'testPassword',
      firstName: 'Dashboard',
      lastName: 'User',
    };

    testUser = await userStore.create(testUserToCreate);

    testProduct = await productStore.create({
      name: `Dashboard product A ${Math.floor(Math.random() * 1000000)}`,
      price: 12.34,
    });

    higherPriceProduct = await productStore.create({
      name: `Dashboard product B ${Math.floor(Math.random() * 1000000)}`,
      price: 45.67,
    });

    const testOrder = await orderStore.create({
      status: 'active',
      userId: testUser.id,
    });

    testOrderId = testOrder.id;
    await orderStore.addProduct(1, String(testOrder.id), String(testProduct.id));
  });

  afterAll(async () => {
    await orderStore.removeProduct(String(testOrderId), String(testProduct.id));
    await orderStore.hardDelete(String(testOrderId));
    await userStore.hardDelete(String(testUser.id));
    await productStore.hardDelete(String(testProduct.id));
    await productStore.hardDelete(String(higherPriceProduct.id));
  });

  describe('productsInOrders', () => {
    it('should return products that have been included in orders', async () => {
      const products = await dashboardQueries.productsInOrders();

      expect(products).toEqual(
        jasmine.arrayContaining([
          jasmine.objectContaining({
            name: testProduct.name,
            price: testProduct.price,
            orderId: String(testOrderId),
          }),
        ]),
      );
    });
  });

  describe('usersWithOrders', () => {
    it('should return all users that have made an order', async () => {
      const users = await dashboardQueries.usersWithOrders();

      expect(users).toEqual(
        jasmine.arrayContaining([
          jasmine.objectContaining({
            id: testUser.id,
            username: testUser.username,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
          }),
        ]),
      );
    });
  });

  describe('getMostExpensiveProducts', () => {
    it('should return the requested number of products in descending price order', async () => {
      const numProducts = 2;
      const products = await dashboardQueries.getMostExpensiveProducts(numProducts);

      expect(products.length).toBe(numProducts);

      const relevantProducts = products.filter(
        (product) => product.name === testProduct.name || product.name === higherPriceProduct.name,
      );

      expect(relevantProducts).toEqual([
        jasmine.objectContaining({
          name: higherPriceProduct.name,
          price: higherPriceProduct.price,
        }),
        jasmine.objectContaining({
          name: testProduct.name,
          price: testProduct.price,
        }),
      ]);

      const [firstProduct, secondProduct] = relevantProducts;
      expect(firstProduct).toBeDefined();
      expect(secondProduct).toBeDefined();

      if (!firstProduct || !secondProduct) {
        throw new Error('Expected both matching products to be present');
      }

      expect(firstProduct.price).toBeGreaterThanOrEqual(secondProduct.price);
    });

    it('should throw an error when the requested product count is invalid', async () => {
      const invalidValues = [-1, 0.5, '2' as unknown as number];

      for (const invalidValue of invalidValues) {
        await expectAsync(dashboardQueries.getMostExpensiveProducts(invalidValue)).toBeRejected();
      }
    });
  });
});
