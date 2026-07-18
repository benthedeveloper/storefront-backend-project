import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app.ts';
import { type Order, type CreateOrderInput, type UpdateOrderInput, OrderStore } from '../../../models/order.ts';
import { type User, UserStore } from '../../../models/user.ts';
import { type Product, ProductStore } from '../../../models/product.ts';
import { seedUser, seedProduct, seedOrder } from '../../../tests/helpers/seed.ts';

const orderStore = new OrderStore();
const productStore = new ProductStore();
const userStore = new UserStore();

describe('Orders API Endpoints', () => {
  let testUser: User;
  let anotherTestUser: User;
  let authToken: string;

  beforeAll(async () => {
    // Create test user via store/helper to generate a valid token
    testUser = await seedUser(1);

    // Sign a real token
    authToken = jwt.sign({ user: testUser }, process.env.TOKEN_SECRET as string);
  });

  afterAll(async () => {
    // Direct DB teardown for main test user
    if (testUser?.id) {
      await userStore.hardDelete(String(testUser.id));
    }
  });

  // Test POST /api/orders (Create Order)
  describe('POST /api/orders', () => {
    let localOrderId: number;

    afterAll(async () => {
      if (localOrderId) {
        await orderStore.hardDelete(String(localOrderId));
      }
    });

    it('should create a new order', async () => {
      const payload: CreateOrderInput = {
        status: 'active',
        userId: testUser.id,
      };

      const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${authToken}`).send(payload);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toEqual(payload.status);

      localOrderId = response.body.id;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${authToken}`).send({});
      expect(response.status).toBe(400);
    });

    it('should return 400 if status is not valid', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' });
      expect(response.status).toBe(400);
    });
  });

  // TEST PUT /api/orders/:id (Update order)
  describe('PUT /api/orders/:id', () => {
    let testOrder: Order;

    beforeAll(async () => {
      // Seeding
      testOrder = await seedOrder(testUser.id);
      anotherTestUser = await seedUser(2);
    });

    afterAll(async () => {
      // Teardown
      await orderStore.hardDelete(String(testOrder.id));
      await userStore.hardDelete(String(anotherTestUser.id));
    });

    it('should update an order status', async () => {
      const payload: UpdateOrderInput = { status: 'pending' };
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual(payload.status);
    });

    it('should update an order status and userId', async () => {
      const payload: UpdateOrderInput = {
        status: 'active',
        userId: anotherTestUser.id,
      };
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(anotherTestUser.id);
      expect(response.body.status).toEqual(payload.status);
    });

    it('should return 404 status for order id that does not exist', async () => {
      const response = await request(app)
        .put(`/api/orders/99999`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'active' });

      expect(response.status).toBe(404);
    });
  });

  // Test GET /api/orders/:id (Public show route)
  describe('GET /api/orders/:id', () => {
    let testOrder: Order;

    beforeAll(async () => {
      testOrder = await seedOrder(testUser.id);
    });

    afterAll(async () => {
      await orderStore.hardDelete(String(testOrder.id));
    });

    it('should fetch a single order by id', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testOrder.id);
    });

    it('should return 404 for a order that does not exist', async () => {
      const response = await request(app).get('/api/orders/99999').set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });
  });

  // Test GET /api/orders (Public index route)
  describe('GET /api/orders', () => {
    it('should fetch all orders', async () => {
      const response = await request(app).get('/api/orders').set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Test DELETE /api/orders/:id (Protected route & ownership check)
  describe('DELETE /api/orders/:id', () => {
    let testOrder: Order;

    beforeEach(async () => {
      testOrder = await seedOrder(testUser.id);
    });

    afterEach(async () => {
      await orderStore.hardDelete(String(testOrder.id));
    });

    it('should return 401 if no authorization token is provided', async () => {
      const response = await request(app).delete(`/api/orders/${testOrder.id}`);
      expect(response.status).toBe(401);
    });

    it('should delete an order when authorized', async () => {
      const response = await request(app)
        .delete(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });

  // Test POST /api/orders/:id/products (Add Product to Order)
  describe('POST /api/orders/:id/products', () => {
    let testOrder: Order;
    let createdProductId: number;

    beforeEach(async () => {
      testOrder = await seedOrder(testUser.id);
    });

    afterEach(async () => {
      if (createdProductId) {
        await orderStore.removeProduct(String(testOrder.id), String(createdProductId));
        await productStore.hardDelete(String(createdProductId));
      }
      await orderStore.hardDelete(String(testOrder.id));
    });

    it('should add a product to an order', async () => {
      const testProduct = await seedProduct(201);
      createdProductId = testProduct.id;

      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 2, productId: testProduct.id });

      expect(response.status).toBe(201);
    });

    it('should return 400 if quantity is not a positive number', async () => {
      const testProduct = await seedProduct(202);
      createdProductId = testProduct.id;

      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: -1, productId: testProduct.id });

      expect(response.status).toBe(400);
    });

    it('should return 400 if productId is missing', async () => {
      const testProduct = await seedProduct(203);
      createdProductId = testProduct.id;
      const addProductPayload = {
        quantity: 1,
      };
      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(addProductPayload);
      expect(response.status).toBe(400);
    });

    it('should return 400 if the order is not active', async () => {
      const testProduct = await seedProduct(204);
      createdProductId = testProduct.id;

      // Close the order directly in DB
      await orderStore.update(String(testOrder.id), { status: 'completed' });

      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 1, productId: testProduct.id });

      expect(response.status).toBe(400);
    });
  });

  // TEST DELETE /api/orders/:id/products/:productId (Remove Product from Order)
  describe('DELETE /api/orders/:id/products/:productId', () => {
    let testOrder: Order;
    let testProduct: Product;

    beforeEach(async () => {
      testOrder = await seedOrder(testUser.id);
      testProduct = await seedProduct(301);
      await orderStore.addProduct(1, String(testOrder.id), String(testProduct.id));
    });

    afterEach(async () => {
      await orderStore.removeProduct(String(testOrder.id), String(testProduct.id));
      await productStore.hardDelete(String(testProduct.id));
      await orderStore.hardDelete(String(testOrder.id));
    });

    it('should remove a product from an order', async () => {
      const response = await request(app)
        .delete(`/api/orders/${testOrder.id}/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });
});
