import { Router } from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from '../controllers/menu.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createMenuSchema, updateMenuSchema } from '../schemas/menu.schema.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/', getAllMenuItems); // Public
router.get('/:id', getMenuItemById); // Public
router.post('/', verifyToken, requireAdmin, upload.single('image'), validate(createMenuSchema), createMenuItem);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), validate(updateMenuSchema), updateMenuItem);
router.delete('/:id', verifyToken, requireAdmin, deleteMenuItem);
router.patch('/:id/toggle', verifyToken, requireAdmin, toggleAvailability);

export default router;
