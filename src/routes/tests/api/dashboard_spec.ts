import request from 'supertest';
import app from '../../../app.ts';
import { type User, UserStore } from '../../../models/user.ts';
import { type Product, ProductStore } from '../../../models/product.ts';
import { type Order, OrderStore } from '../../../models/order.ts';
import { seedUser, seedProduct, seedOrder } from '../../../tests/helpers/seed.ts';

const userStore = new UserStore();
const productStore = new ProductStore();
const orderStore = new OrderStore();

describe('Dashboard API Endpoints', () => {
  let user: User;
  let userWithoutOrder: User;
  let product1: Product;
  let product2: Product;
  let product3: Product;
  let product4: Product;
  let product5: Product;
  let product6: Product;
  let order: Order;

  beforeAll(async () => {
    // Seed database with users, products, and orders
    user = await seedUser(1);
    userWithoutOrder = await seedUser(2);
    product1 = await seedProduct(1);
    product2 = await seedProduct(2);
    product3 = await seedProduct(3);
    product4 = await seedProduct(4);
    product5 = await seedProduct(5);
    product6 = await seedProduct(6);
    order = await seedOrder(user.id);

    // Add product to order
    await orderStore.addProduct(1, String(order.id), String(product1.id));
  });

  afterAll(async () => {
    // Clean up
    await orderStore.removeProduct(String(order.id), String(product1.id));
    await orderStore.hardDelete(String(order.id));
    await productStore.hardDelete(String(product1.id));
    await productStore.hardDelete(String(product2.id));
    await productStore.hardDelete(String(product3.id));
    await productStore.hardDelete(String(product4.id));
    await productStore.hardDelete(String(product5.id));
    await productStore.hardDelete(String(product6.id));
    await userStore.hardDelete(String(user.id));
    await userStore.hardDelete(String(userWithoutOrder.id));
  });

  // Test GET /api/dashboard/products-in-orders (Get all products that have been included in orders)
  describe('GET /api/dashboard/products-in-orders', () => {
    it('should get all products that have been included in orders', async () => {
      const response = await request(app).get('/api/dashboard/products-in-orders');

      expect(response.status).toBe(200);
      const productNames = response.body.map((item: { name: string }) => item.name);

      expect(productNames).toContain(product1.name);
      expect(productNames).not.toContain(product2.name);
    });
  });

  // Test GET /api/dashboard/users-with-orders (Get all users with orders)
  describe('GET /api/dashboard/users-with-orders', () => {
    it('should get all users with orders', async () => {
      const response = await request(app).get('/api/dashboard/users-with-orders');

      expect(response.status).toBe(200);
      const usersWithOrders: User[] = response.body;

      expect(usersWithOrders).toContain(user);
      expect(usersWithOrders).not.toContain(userWithoutOrder);
    });
  });

  // Test GET /api/dashboard/most-expensive-products
  describe('GET /api/dashboard/most-expensive-products', () => {
    it('should get the 5 most expensive products by default, sorted in descending order', async () => {
      const response = await request(app).get('/api/dashboard/most-expensive-products');

      expect(response.status).toBe(200);
      const mostExpensiveProducts: Product[] = response.body;

      expect(mostExpensiveProducts.length).toBe(5);
      expect(mostExpensiveProducts).toEqual([product6, product5, product4, product3, product2]);
    });

    it('should get the 2 most expensive products if limit query param is 2, sorted in descending order', async () => {
      const limit = 2;
      const response = await request(app).get('/api/dashboard/most-expensive-products').query({ limit });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(limit);

      expect(response.body).toEqual([product6, product5]);
    });

    it('should return status 400 if limit query param is not a number', async () => {
      const limit = 'invalid';
      const response = await request(app).get('/api/dashboard/most-expensive-products').query({ limit });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if limit query param is negative or 0', async () => {
      const limitNegValue = -1;
      const responseNeg = await request(app)
        .get('/api/dashboard/most-expensive-products')
        .query({ limit: limitNegValue });

      const limitZeroValue = 0;
      const responseZero = await request(app)
        .get('/api/dashboard/most-expensive-products')
        .query({ limit: limitZeroValue });

      expect(responseNeg.status).toBe(400);
      expect(responseZero.status).toBe(400);
    });
  });
});
