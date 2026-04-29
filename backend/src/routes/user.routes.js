import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema.js';

const router = Router();

// All user management routes require Admin privileges
router.use(verifyToken, requireAdmin);

router.get('/', getAllUsers);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
