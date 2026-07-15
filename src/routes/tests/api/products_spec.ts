import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app.ts';
import { type User, UserStore } from '../../../models/user.ts';
import { type Product, ProductStore } from '../../../models/product.ts';
import { seedUser, seedProduct } from '../../../tests/helpers/seed.ts';

const productStore = new ProductStore();
const userStore = new UserStore();

describe('Products API Endpoints', () => {
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    // Create test user via store/helper to generate a valid token
    testUser = await seedUser(1);

    // Sign a real token
    authToken = jwt.sign({ user: testUser }, process.env.TOKEN_SECRET as string);
  });

  afterAll(async () => {
    // Clean up the main test user we used for authentication
    if (testUser?.id) {
      await userStore.hardDelete(String(testUser.id));
    }
  });

  // Test POST /api/products (Create Product)
  describe('POST /api/products', () => {
    let createdProductId: number;

    afterEach(async () => {
      // Direct teardown using Store: Clean up the product created during testing
      if (createdProductId) {
        await productStore.hardDelete(String(createdProductId));
      }
    });

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

      createdProductId = response.body.id; // Store ID for fast model deletion
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
      // Creat a test product
      testProduct = await seedProduct(101);
    });

    afterAll(async () => {
      // Direct Teardown via Store
      await productStore.hardDelete(String(testProduct.id));
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
        name: 'ghost_product',
        price: 10.5,
      };
      const response = await request(app)
        .put(`/api/products/99999`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(404);
    });
  });

  // Test GET /api/products/:id (Public show route)
  describe('GET /api/products/:id', () => {
    let testProduct: Product;

    beforeEach(async () => {
      // Fast database seeding
      testProduct = await seedProduct(102);
    });

    afterEach(async () => {
      // Direct DB cleanup
      await productStore.hardDelete(String(testProduct.id));
    });

    it('should fetch a single product by id', async () => {
      const response = await request(app).get(`/api/products/${testProduct.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testProduct.id);
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
    let testProduct: Product;

    beforeEach(async () => {
      // Fast database seeding
      testProduct = await seedProduct(103);
    });

    afterEach(async () => {
      // Clean up just in case the DELETE endpoint failed to wipe it out
      await productStore.hardDelete(String(testProduct.id));
    });

    it('should return 401 if no authorization token is provided', async () => {
      const response = await request(app).delete(`/api/products/${testProduct.id}`);
      expect(response.status).toBe(401);
    });

    it('should delete a product when authorized', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });
});
