import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app.ts';

describe('Users API Endpoints', () => {
  let SECRET: string;

  beforeAll(() => {
    SECRET = process.env.TOKEN_SECRET as string;
  });

  // Test POST /api/users (Create User & Get Token)
  describe('POST /api/users', () => {
    it('should create a new user and return a JWT token', async () => {
      const payload = {
        username: `user_${Date.now()}`, // Unique username to prevent DB conflicts
        password: 'password123',
        firstName: 'Derp',
        lastName: 'Derpington',
      };

      const response = await request(app).post('/api/users').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidPayload = { username: 'missingfields' };
      const response = await request(app).post('/api/users').send(invalidPayload);
      expect(response.status).toBe(400);
    });
  });

  // Test POST /api/users/authenticate
  describe('POST /api/users/authenticate', () => {
    // Set up temp user for authentication tests
    beforeEach(async () => {
      await request(app).post('/api/users').send({
        username: 'auth_test_user',
        password: 'password123',
        firstName: 'Auth',
        lastName: 'Test',
      });
    });

    it('should successfully authenticate and return a token', async () => {
      const response = await request(app)
        .post('/api/users/authenticate')
        .send({ username: 'auth_test_user', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });

  // Test GET /api/users/:id (Public show route)
  describe('GET /api/users/:id', () => {
    let localUserId: number;

    // Create a target user before running show tests
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: `get_${Date.now()}`,
          password: 'password123',
          firstName: 'Get',
          lastName: 'Test',
        });
      localUserId = response.body.user.id;
    });

    it('should fetch a single user by id', async () => {
      const response = await request(app).get(`/api/users/${localUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(localUserId);
    });

    it('should return 404 for a user that does not exist', async () => {
      const response = await request(app).get('/api/users/99999');
      expect(response.status).toBe(404);
    });
  });

  // Test DELETE /api/users/:id (Protected route & ownership check)
  describe('DELETE /api/users/:id', () => {
    let localUserId: number;
    let localAuthToken: string;

    // Each delete spec gets its own user context to work with
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: `del_${Date.now()}`,
          password: 'password123',
          firstName: 'Del',
          lastName: 'Test',
        });
      localUserId = response.body.user.id;
      localAuthToken = response.body.token;
    });

    it('should return 401 if no authorization token is provided', async () => {
      const response = await request(app).delete(`/api/users/${localUserId}`);
      expect(response.status).toBe(401);
    });

    it('should return 403 if a user tries to delete a different user account', async () => {
      const fakeToken = jwt.sign({ sub: 888, username: 'imposter' }, SECRET);

      const response = await request(app)
        .delete(`/api/users/${localUserId}`)
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow a user to delete their own account when authorized', async () => {
      const response = await request(app)
        .delete(`/api/users/${localUserId}`)
        .set('Authorization', `Bearer ${localAuthToken}`);

      expect(response.status).toBe(204);
    });
  });
});
