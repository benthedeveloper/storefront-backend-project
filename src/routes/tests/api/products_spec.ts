import request from 'supertest';
import app from '../../../app.ts';
import { type Product } from '../../../models/product.ts';

describe('Products API Endpoints', () => {
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
    authToken = userResponse.body.token;
  });

  // Test POST /api/products (Create Product)
  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const payload = {
        name: `product_${Date.now()}`,
        price: 19.99,
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toEqual(payload.name);
      expect(response.body.price).toEqual(payload.price);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidPayload = { price: 19.99 };
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayload);
      expect(response.status).toBe(400);
    });

    it('should return 400 if name is not a string', async () => {
      const invalidPayload = { name: 5, price: 19.99 };
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayload);
      expect(response.status).toBe(400);
    });

    describe('validate price', () => {
      it('should return 400 if price is not a number', async () => {
        const invalidPayload = { name: `product_${Date.now()}`, price: 'blah' };
        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidPayload);
        expect(response.status).toBe(400);
      });

      it('should return 400 if price is not positive', async () => {
        const invalidPayload = { name: `product_${Date.now()}`, price: -5.5 };
        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidPayload);
        expect(response.status).toBe(400);
      });
    });
  });

  // TEST PUT /api/products/:id (Update product)
  describe('PUT /api/products/:id', () => {
    let testProduct: Product;

    beforeAll(async () => {
      const payload = {
        name: `product_${Date.now()}`,
        price: 9.99,
      };
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);
      testProduct = response.body;
    });

    it('should update a product with valid data', async () => {
      const payload = {
        name: `updatedProductname_${Date.now()}`,
        price: 10.5,
      };
      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.name).toEqual(payload.name);
      expect(response.body.price).toEqual(payload.price);
    });

    it('should return 404 status for product id that does not exist', async () => {
      const payload = {
        name: `updatedProductname_${Date.now()}`,
        price: 10.5,
      };
      const response = await request(app)
        .put(`/api/products/999`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(404);
    });
  });

  // Test GET /api/products/:id (Public show route)
  describe('GET /api/products/:id', () => {
    let localProductId: number;

    // Create a target product before running show tests
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `get_${Date.now()}`,
          price: 11.0,
        });
      localProductId = response.body.id;
    });

    it('should fetch a single product by id', async () => {
      const response = await request(app).get(`/api/products/${localProductId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(localProductId);
    });

    it('should return 404 for a product that does not exist', async () => {
      const response = await request(app).get('/api/products/99999');
      expect(response.status).toBe(404);
    });
  });

  // Test GET /api/products (Public index route)
  describe('GET /api/products', () => {
    it('should fetch all products', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toEqual(
          jasmine.objectContaining({
            id: jasmine.any(Number),
            name: jasmine.any(String),
            price: jasmine.any(Number),
          }),
        );
      }
    });
  });

  // Test DELETE /api/products/:id (Protected route & ownership check)
  describe('DELETE /api/products/:id', () => {
    let localProductId: number;

    // Each delete spec gets its own product context to work with
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `del_${Date.now()}`,
          price: 900.99,
        });
      localProductId = response.body.id;
    });

    it('should return 401 if no authorization token is provided', async () => {
      const response = await request(app).delete(`/api/products/${localProductId}`);
      expect(response.status).toBe(401);
    });

    it('should delete a product when authorized', async () => {
      const response = await request(app)
        .delete(`/api/products/${localProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });
});
