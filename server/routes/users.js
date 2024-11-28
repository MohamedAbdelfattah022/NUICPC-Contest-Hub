import express from 'express';
import { getUsers, getUser, addUser, updateUser, deleteUser, addBulkUsers } from '../controllers/usersController.js'
import { verifyToken } from '../middleware/auth_middleware.js';
const router = express.Router();

router.use(verifyToken);
router.get('/:id', getUser);
router.get('/', getUsers);
router.post('/', addUser);
router.post('/bulk', addBulkUsers);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;