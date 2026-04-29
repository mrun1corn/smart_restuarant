import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', verifyToken, getMe);

export default router;
