import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app.js';
import prisma from './prisma.js';
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      socket.user = decoded;
    } catch (err) {
      // Invalid token provided
      return next(new Error('Authentication error: Invalid token'));
    }
  }
  // Allow connection to proceed; unauthenticated users can only join public table channels
  next();
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id, socket.user ? `(User: ${socket.user.email}, Role: ${socket.user.role})` : '(Guest)');

  socket.on('join:dashboard', () => {
    // Only staff and admin can join dashboard-room
    if (!socket.user || (socket.user.role !== 'admin' && socket.user.role !== 'receptionist')) {
      socket.emit('error', { message: 'Unauthorized: Staff credentials required for dashboard-room' });
      return;
    }
    socket.join('dashboard-room');
    console.log(`Socket ${socket.id} joined dashboard-room`);
  });

  socket.on('join:table', async (tableId) => {
    if (!tableId || typeof tableId !== 'string') return;
    socket.join(`table:${tableId}`);
    console.log(`Socket ${socket.id} joined table:${tableId}`);
  });

  socket.on('waiter:call', async (data) => {
    if (!data || typeof data !== 'object') return;
    const { tableId } = data;
    if (!tableId || typeof tableId !== 'string') return;

    try {
      const table = await prisma.restaurantTable.findUnique({
        where: { id: tableId }
      });
      if (!table) return;

      io.to('dashboard-room').emit('waiter:request', {
        tableId: table.id,
        tableNumber: table.tableNumber,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error handling waiter:call:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in controllers via app.set
app.set('io', io);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} (exposed to network)`);
});
