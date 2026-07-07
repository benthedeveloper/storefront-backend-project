import { type Request, type Response } from 'express';
import { UserStore, type CreateUserInput, type UpdateUserInput } from '../models/user.ts';

interface UserRouteParams {
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
export const getUser = async (req: Request<UserRouteParams>, res: Response) => {
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
    res.status(201).json(createdUser);
  } catch (error) {
    console.error('createUser error', error);
    res.status(500).json({ error: 'Unable to create user' });
  }
};

// Authenticate a user
export const authenticateUser = async (req: Request, res: Response) => {
  // TODO implement authenticate
  const { username, password } = req.body;

  try {
    const authenticatedUser = await store.authenticate(username, password);

    if (!authenticatedUser) {
      return res.status(401).json({ error: 'Invalid user credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: authenticatedUser,
      // token: 'your-jwt-token'  // <--- TODO JWT token here?
    });
  } catch (error) {
    console.error('authenticateUser error:', error);
    res.status(500).json({ error: 'There was an error authenticating the user' });
  }
};

// Update a user by ID
export const updateUser = async (req: Request<UserRouteParams>, res: Response) => {
  const { id } = req.params;
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
export const deleteUser = async (req: Request<UserRouteParams>, res: Response) => {
  const { id } = req.params;

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
