import express from 'express';
import { login, logout, register, loginLimiter, registerLimiter } from '../controllers/admin_controller.js';
import { verifyToken } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// router.post('/register', registerLimiter, register);
// router.post('/login', loginLimiter, login);

router.use(verifyToken);
router.post('/logout', logout);

export default router;