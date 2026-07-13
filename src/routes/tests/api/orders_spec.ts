import request from 'supertest';
import app from '../../../app.ts';
import { type Order, type CreateOrderInput, type UpdateOrderInput } from '../../../models/order.ts';
import type { User } from '../../../models/user.ts';

describe('Orders API Endpoints', () => {
  let testUser: User;
  let anotherTestUser: User;
  let authToken: string;

  beforeAll(async () => {
    // Create a user to get an auth token for protected routes
    const userResponse = await request(app)
      .post('/api/users')
      .send({
        username: `user_${Date.now()}`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });
    testUser = userResponse.body.user;
    authToken = userResponse.body.token;
  });

  // Test POST /api/orders (Create Order)
  describe('POST /api/orders', () => {
    let localOrderId: number;

    afterAll(async () => {
      await request(app).delete(`/api/orders/${localOrderId}`);
    });

    it('should create a new order', async () => {
      const payload: CreateOrderInput = {
        status: 'active',
        userId: testUser.id,
      };

      const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${authToken}`).send(payload);
      localOrderId = response.body.id;

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toEqual(payload.status);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidPayload = {}; // Missing both status and userId
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayload);
      expect(response.status).toBe(400);
    });

    it('should return 400 status is not valid', async () => {
      const invalidPayload = { status: 'invalid_status' }; // Invalid status
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayload);
      expect(response.status).toBe(400);
    });
  });

  // TEST PUT /api/orders/:id (Update order)
  describe('PUT /api/orders/:id', () => {
    let testOrder: Order;

    beforeAll(async () => {
      const payload: CreateOrderInput = {
        status: 'active',
        userId: testUser.id,
      };
      const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${authToken}`).send(payload);
      testOrder = response.body;

      // Create another user to test updating the order's userId
      const anotherUserResponse = await request(app)
        .post('/api/users')
        .send({
          username: `user_${Date.now()}`,
          password: 'password123',
          firstName: 'Another',
          lastName: 'User',
        });
      anotherTestUser = anotherUserResponse.body.user;
    });

    afterAll(async () => {
      await request(app).delete(`/api/orders/${testOrder.id}`);
    });

    it('should update an order status', async () => {
      const payload: UpdateOrderInput = {
        status: 'pending',
      };
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testOrder.id);
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
      expect(response.body.id).toBe(testOrder.id);
      expect(response.body.userId).toBe(anotherTestUser.id);
      expect(response.body.status).toEqual(payload.status);
    });

    it('should return 404 status for order id that does not exist', async () => {
      const payload: UpdateOrderInput = {
        status: 'active',
      };
      const response = await request(app)
        .put(`/api/orders/999`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(404);
    });
  });

  // Test GET /api/orders/:id (Public show route)
  describe('GET /api/orders/:id', () => {
    let localOrderId: number;

    // Create a target order before running show tests
    beforeAll(async () => {
      const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${authToken}`).send({
        status: 'active',
        userId: testUser.id,
      });
      localOrderId = response.body.id;
    });

    afterAll(async () => {
      await request(app).delete(`/api/orders/${localOrderId}`);
    });

    it('should fetch a single order by id', async () => {
      const response = await request(app).get(`/api/orders/${localOrderId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(localOrderId);
    });

    it('should return 404 for a order that does not exist', async () => {
      const response = await request(app).get('/api/orders/99999');
      expect(response.status).toBe(404);
    });
  });

  // Test GET /api/orders (Public index route)
  describe('GET /api/orders', () => {
    it('should fetch all orders', async () => {
      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toEqual(
          jasmine.objectContaining({
            id: jasmine.any(Number),
            status: jasmine.any(String),
            userId: jasmine.any(Number),
          }),
        );
      }
    });
  });

  // Test DELETE /api/orders/:id (Protected route & ownership check)
  describe('DELETE /api/orders/:id', () => {
    let localOrderId: number;

    // Each delete spec gets its own order context to work with
    beforeEach(async () => {
      const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${authToken}`).send({
        status: 'active',
        userId: testUser.id,
      });
      localOrderId = response.body.id;
    });

    afterEach(async () => {
      const localOrderResponse = await request(app).get(`/api/orders/${localOrderId}`);
      if (localOrderResponse.body.id === localOrderId) {
        await request(app).delete(`/api/orders/${localOrderId}`);
      }
    });

    it('should return 401 if no authorization token is provided', async () => {
      const response = await request(app).delete(`/api/orders/${localOrderId}`);
      expect(response.status).toBe(401);
    });

    it('should delete a order when authorized', async () => {
      const response = await request(app)
        .delete(`/api/orders/${localOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });

  // Test POST /api/orders/:id/products (Add Product to Order)
  describe('POST /api/orders/:id/products', () => {
    let localOrderId: number;

    // Create a target order before running add product tests
    beforeEach(async () => {
      const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${authToken}`).send({
        status: 'active',
        userId: testUser.id,
      });
      localOrderId = response.body.id;
    });

    afterEach(async () => {
      // Clean up the order
      await request(app).delete(`/api/orders/${localOrderId}`);
    });

    it('should add a product to an order', async () => {
      // Create product
      const productPayload = { name: `product_${Date.now()}_1`, price: 20.0 };
      const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productPayload);
      const productId = productResponse.body.id;

      // Add to order
      const addProductPayload = { quantity: 2, productId };
      const response = await request(app)
        .post(`/api/orders/${localOrderId}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(addProductPayload);

      expect(response.status).toBe(201);

      // Remove product from order
      await request(app)
        .delete(`/api/orders/${localOrderId}/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
      // Delete product
      await request(app).delete(`/api/products/${productId}`).set('Authorization', `Bearer ${authToken}`);
    });

    it('should return 400 if quantity is not a positive number', async () => {
      const productPayload = {
        name: `product_${Date.now()}`,
        price: 20.0,
      };
      const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productPayload);
      const productId = productResponse.body.id;

      const addProductPayload = {
        quantity: -1,
        productId,
      };
      const response = await request(app)
        .post(`/api/orders/${localOrderId}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(addProductPayload);

      expect(response.status).toBe(400);

      // Clean product (no order association existed, so just delete the product)
      await request(app).delete(`/api/products/${productId}`).set('Authorization', `Bearer ${authToken}`);
    });

    it('should return 400 if productId is missing', async () => {
      const addProductPayload = {
        quantity: 1,
      };
      const response = await request(app)
        .post(`/api/orders/${localOrderId}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(addProductPayload);
      expect(response.status).toBe(400);
    });

    it('should return 400 if the order is not active', async () => {
      const productPayload = {
        name: `product_${Date.now()}`,
        price: 20.0,
      };
      const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productPayload);
      const productId = productResponse.body.id;

      // Update the order to "completed" status to simulate a non-active order
      await request(app)
        .put(`/api/orders/${localOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });
      const addProductPayload = {
        quantity: 1,
        productId,
      };
      const response = await request(app)
        .post(`/api/orders/${localOrderId}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(addProductPayload);

      expect(response.status).toBe(400);

      // Clean product (no order association existed, so just delete the product)
      await request(app).delete(`/api/products/${productId}`).set('Authorization', `Bearer ${authToken}`);
    });
  });

  // TEST DELETE /api/orders/:id/products/:productId (Remove Product from Order)
  describe('DELETE /api/orders/:id/products/:productId', () => {
    let localOrderId: number;
    let localProductId: number;

    // Create a target order and product before running remove product tests
    beforeEach(async () => {
      const orderResponse = await request(app).post('/api/orders').set('Authorization', `Bearer ${authToken}`).send({
        status: 'active',
        userId: testUser.id,
      });
      localOrderId = orderResponse.body.id;
      const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `product_${Date.now()}`,
          price: 20.0,
        });
      localProductId = productResponse.body.id;

      // Add the product to the order
      await request(app)
        .post(`/api/orders/${localOrderId}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 1, productId: localProductId });
    });

    afterEach(async () => {
      // Delete the product that was created
      await request(app).delete(`/api/products/${localProductId}`).set('Authorization', `Bearer ${authToken}`);

      // delete the order that was created
      await request(app).delete(`/api/orders/${localOrderId}`);
    });

    it('should remove a product from an order', async () => {
      const response = await request(app)
        .delete(`/api/orders/${localOrderId}/products/${localProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });

  afterAll(async () => {
    // Remove test users
    await request(app).delete(`/api/users/${testUser.id}`);
    await request(app).delete(`/api/users/${anotherTestUser.id}`);
  });
});
