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
      name: `Dashboard product ${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      price: 12.34,
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
});
