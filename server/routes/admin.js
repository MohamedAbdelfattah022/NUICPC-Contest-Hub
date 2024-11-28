import express from 'express';
import { login, logout, register, loginLimiter, registerLimiter } from '../controllers/admin_controller.js';
// import { login, logout, refresh, verify, register, loginLimiter, registerLimiter } from '../controllers/admin_controller.js';
import { verifyToken } from '../middleware/auth_middleware.js';
// import { verifyToken, auditMiddleware } from '../middleware/auth_middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// router.post('/register', registerLimiter, register);
// router.post('/login', loginLimiter, login);

// router.post('/refresh-token', refresh);
router.use(verifyToken);
router.post('/logout', logout);
// router.get('/verify-session', verify);

export default router;