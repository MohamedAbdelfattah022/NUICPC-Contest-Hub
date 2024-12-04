import express from 'express';
import { login, logout, register, inviteAdmin, forgotPass, resetPass, loginLimiter, registerLimiter } from '../controllers/admin_controller.js';
import { verifyToken } from '../middleware/auth_middleware.js';
import { validateSession } from '../middleware/session_middleware.js';

const router = express.Router();

// router.post('/register', register);
router.post('/login', validateSession, login);
// router.post('/login', loginLimiter, login);
// router.post('/reset-password', resetPassword);

router.post('/register', register);
router.post('/forgot', forgotPass);
router.put('/reset-pass', resetPass);

router.use(verifyToken);
router.post('/invite', inviteAdmin);
router.post('/logout', logout);

export default router;