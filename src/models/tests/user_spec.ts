import { type User, type CreateUserInput, UserStore, type UpdateUserInput } from '../user.ts';

const store = new UserStore();
const testUserToCreate: CreateUserInput = {
  username: 'testUser',
  password: 'testPassword',
  firstName: 'Test',
  lastName: 'User',
};

describe('User Model', () => {
  describe('Methods exist', () => {
    it('should have a create method', () => {
      expect(store.create).toBeDefined();
    });

    it('should have an authenticate method', () => {
      expect(store.authenticate).toBeDefined();
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

  describe('create user tests', () => {
    it('create method should add a User', async () => {
      const result = await store.create(testUserToCreate);
      try {
        expect(result.id).toBeGreaterThanOrEqual(1);
        expect(result.username).toEqual(testUserToCreate.username);
        expect(result.firstName).toEqual(testUserToCreate.firstName);
        expect(result.lastName).toEqual(testUserToCreate.lastName);
      } finally {
        await store.hardDelete(String(result.id));
      }
    });
  });

  describe('authenticate user tests', () => {
    let testUser: User;

    beforeAll(async () => {
      testUser = await store.create(testUserToCreate);
    });

    afterAll(async () => {
      await store.hardDelete(String(testUser.id));
    });

    it('authenticate method should return a User for valid credentials', async () => {
      const result = await store.authenticate(testUserToCreate.username, testUserToCreate.password);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.id).toEqual(testUser.id);
        expect(result.username).toEqual(testUser.username);
        expect(result.firstName).toEqual(testUser.firstName);
        expect(result.lastName).toEqual(testUser.lastName);
      }
    });
  });

  describe('read user tests', () => {
    let testUser: User;

    beforeAll(async () => {
      testUser = await store.create(testUserToCreate);
    });

    afterAll(async () => {
      await store.hardDelete(String(testUser.id));
    });

    it('index method should return a list of Users', async () => {
      const result = await store.index();
      expect(result.length).toBeGreaterThan(0);
    });

    it('show method should return the correct User', async () => {
      const result = await store.show(String(testUser.id));
      expect(result.id).toEqual(testUser.id);
      expect(result.username).toEqual(testUser.username);
      expect(result.firstName).toEqual(testUser.firstName);
      expect(result.lastName).toEqual(testUser.lastName);
    });
  });

  describe('update user tests', () => {
    let testUser: User;

    beforeAll(async () => {
      testUser = await store.create(testUserToCreate);
    });

    afterAll(async () => {
      await store.hardDelete(String(testUser.id));
    });

    it('update method should update the User', async () => {
      const updatedUserData: UpdateUserInput = {
        username: 'updated_test_user',
        firstName: 'Updated Test First Name',
        lastName: 'Updated Test Last Name',
        password: 'updated_test_password',
      };
      const expectedUser: User = {
        id: testUser.id,
        username: updatedUserData.username!,
        firstName: updatedUserData.firstName!,
        lastName: updatedUserData.lastName!,
      };
      const result = await store.update(String(testUser.id), updatedUserData);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('delete user tests', () => {
    let testUser: User;

    beforeAll(async () => {
      testUser = await store.create(testUserToCreate);
    });

    it('hardDelete method should delete the User', async () => {
      const result = await store.hardDelete(String(testUser.id));
      expect(result).toBe(true);
    });
  });
});
