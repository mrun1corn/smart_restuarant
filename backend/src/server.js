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
import app from './app.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join:dashboard', () => {
    socket.join('dashboard-room');
    console.log(`Socket ${socket.id} joined dashboard-room`);
  });

  socket.on('join:table', (tableId) => {
    socket.join(`table:${tableId}`);
    console.log(`Socket ${socket.id} joined table:${tableId}`);
  });

  socket.on('waiter:call', (data) => {
    const { tableId, tableNumber } = data;
    console.log(`Waiter called to table ${tableNumber} (${tableId})`);
    io.to('dashboard-room').emit('waiter:request', { tableId, tableNumber, timestamp: new Date() });
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
