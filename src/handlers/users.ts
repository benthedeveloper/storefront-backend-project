import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { type AuthenticatedRequest } from '../middleware/auth.middleware.ts';
import { UserStore, type CreateUserInput, type UpdateUserInput } from '../models/user.ts';

interface GetUserRouteParams {
  id: string;
}

const store = new UserStore();

// Get all users
export const index = async (_req: Request, res: Response) => {
  try {
    const allUsers = await store.index();
    res.status(200).json(allUsers);
  } catch (error) {
    console.error('index error', error);
    res.status(500).json({ error: 'Unable to fetch users' });
  }
};

// Get user by ID
export const getUser = async (req: Request<GetUserRouteParams>, res: Response) => {
  const { id } = req.params;

  try {
    const foundUser = await store.show(id);
    if (!foundUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(foundUser);
  } catch (error) {
    console.error('getUserById error', error);
    res.status(500).json({ error: 'Unable to fetch user' });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  // const { title, author, totalPages, summary }: CreateUserInput = req.body;
  const { username, password, firstName, lastName }: CreateUserInput = req.body;

  if (!username || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const payload = { username, password, firstName, lastName };

  try {
    const createdUser = await store.create(payload);

    const token = jwt.sign(
      { sub: createdUser.id, username: createdUser.username },
      process.env.TOKEN_SECRET as string,
      { expiresIn: '1h' },
    );

    res.status(201).json({ user: createdUser, token });
  } catch (error) {
    console.error('createUser error', error);
    res.status(500).json({ error: 'Unable to create user' });
  }
};

// Authenticate a user
export const authenticateUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const authenticatedUser = await store.authenticate(username, password);

    if (!authenticatedUser) {
      return res.status(401).json({ error: 'Invalid user credentials' });
    }

    const token = jwt.sign(
      { sub: authenticatedUser.id, username: authenticatedUser.username },
      process.env.TOKEN_SECRET as string,
      { expiresIn: '1h' },
    );

    res.status(200).json({ user: authenticatedUser, token });
  } catch (error) {
    console.error('authenticateUser error:', error);
    res.status(500).json({ error: 'There was an error authenticating the user' });
  }
};

// Update a user by ID
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const authenticatedUser = req.user;

  if (!authenticatedUser || authenticatedUser.id !== Number(id)) {
    return res.status(403).json({ error: 'You can only update your own account' });
  }

  const { firstName, lastName, username, password }: UpdateUserInput = req.body;

  if (!firstName && !lastName && !username && !password) {
    return res.status(400).json({ error: 'Missing a field to update' });
  }

  const payload: UpdateUserInput = {};

  if (firstName !== undefined) {
    payload.firstName = firstName;
  }

  if (lastName !== undefined) {
    payload.lastName = lastName;
  }

  if (username !== undefined) {
    payload.username = username;
  }

  if (password !== undefined) {
    payload.password = password;
  }

  try {
    const updatedUser = await store.update(id, payload);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('updateUser error', error);
    res.status(500).json({ error: 'Unable to update user' });
  }
};

// Delete a user
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const authenticatedUser = req.user;

  if (!authenticatedUser || authenticatedUser.id !== Number(id)) {
    return res.status(403).json({ error: 'You can only delete your own account' });
  }

  try {
    const deleteResult = await store.hardDelete(id);
    if (!deleteResult) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('deleteUser error', error);
    res.status(500).json({ error: 'Unable to delete user' });
  }
};
