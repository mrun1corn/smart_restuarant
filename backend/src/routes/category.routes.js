import { Router } from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema.js';

const router = Router();

router.get('/', getAllCategories); // Public
router.post('/', verifyToken, requireAdmin, validate(createCategorySchema), createCategory);
router.put('/:id', verifyToken, requireAdmin, validate(updateCategorySchema), updateCategory);
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

export default router;
