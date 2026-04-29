import { Router } from 'express';
import { 
  getAllTables, 
  getTableById, 
  createTable, 
  updateTable, 
  deleteTable, 
  regenerateQR 
} from '../controllers/table.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createTableSchema, updateTableSchema } from '../schemas/table.schema.js';

const router = Router();

router.get('/', verifyToken, getAllTables);
router.get('/:id', getTableById);
router.post('/', verifyToken, requireAdmin, validate(createTableSchema), createTable);
router.put('/:id', verifyToken, requireAdmin, validate(updateTableSchema), updateTable);
router.delete('/:id', verifyToken, requireAdmin, deleteTable);
router.post('/:id/regenerate-qr', verifyToken, requireAdmin, regenerateQR);

export default router;
