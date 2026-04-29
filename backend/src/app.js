import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import tableRoutes from './routes/table.routes.js';
import categoryRoutes from './routes/category.routes.js';
import menuRoutes from './routes/menu.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import reportRoutes from './routes/report.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reports', reportRoutes);

// Basic Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Smart Restaurant API is running' });
});

// Serve Static Frontend Files in Production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  // Catch-all route to serve index.html for React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error Handler
app.use(errorHandler);

export default app;
