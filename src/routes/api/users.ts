import { Router } from 'express';
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

// Edit route
users.put('/:id', updateUser);

// Delete route
users.delete('/:id', deleteUser);

export default users;
