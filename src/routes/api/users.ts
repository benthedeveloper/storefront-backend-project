import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.ts';
import { index, getUser, createUser, authenticateUser, updateUser, deleteUser } from '../../handlers/users.ts';

const users = Router();

// Index route
users.get('/', index);

// Show route
users.get('/:id', getUser);

// Create route
users.post('/', createUser);

// Authenticate route
users.post('/authenticate', authenticateUser);

// Edit route - protected by authentication middleware
users.put('/:id', authenticateToken, updateUser);

// Delete route - protected by authentication middleware
users.delete('/:id', authenticateToken, deleteUser);

export default users;
