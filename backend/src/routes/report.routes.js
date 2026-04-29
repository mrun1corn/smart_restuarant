import { Router } from 'express';
import { getSalesReport, getInventoryReport } from '../controllers/report.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Secure all report routes to admins
router.use(verifyToken, requireAdmin);

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);

export default router;
