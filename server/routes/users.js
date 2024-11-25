import express from 'express';
import { getUsers, getUser, addUser, updateUser, deleteUser, addBulkUsers } from '../controllers/usersController.js'

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', addUser);
router.post('/bulk', addBulkUsers);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
export default router;