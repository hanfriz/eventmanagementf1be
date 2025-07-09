import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authValidators } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', authValidators.register, authController.register);

// Login
router.post('/login', authValidators.login, authController.login);

// Change password (requires authentication)
router.put('/change-password', authenticate, authController.changePassword);

// Get profile (requires authentication)
router.get('/profile', authenticate, authController.getProfile);

// Refresh token (requires authentication)
router.post('/refresh-token', authenticate, authController.refreshToken);

export default router;
