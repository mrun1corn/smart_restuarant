# Smart Restaurant System

A full-stack digital menu and order management system for restaurants. Customers can scan a QR code on their table to view the menu and place orders. Staff can manage categories, menu items, tables, and track orders in real-time.

## 🚀 Features

### Customer Features
- **QR Code Access**: Instant access to the menu by scanning a table-specific QR code.
- **Digital Menu**: Browse categories and menu items with descriptions and photos.
- **Cart Management**: Add/remove items and add notes to specific orders.
- **Real-time Status**: (Planned) Live updates on order preparation.

### Admin/Staff Features
- **Dashboard**: Real-time overview of active orders and table status via WebSockets.
- **Menu Management**: Full CRUD for categories and menu items with image uploads (Cloudinary).
- **Table Management**: Generate QR codes for tables and monitor occupancy.
- **Report System**: View sales and order statistics.
- **Staff Management**: Role-based access control (Admin/Receptionist).

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Zustand, React Query, Socket.io-client.
- **Backend**: Node.js (Express), Prisma ORM, Socket.io, JWT Authentication.
- **Database**: SQLite (Development), PostgreSQL (Production ready).
- **Storage**: Cloudinary (Image hosting).

## 📦 Project Structure

```
.
├── backend/            # Express.js API & Prisma
├── frontend/           # React (Vite) Application
├── ecosystem.config.cjs # PM2 production configuration
└── prd.md              # Project Requirements Document
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone & Install
```bash
git clone <repository-url>
cd smart-restaurant-system
npm run install-all
```

### 2. Environment Variables
Create `.env` files in both `backend` and `frontend` directories using the provided examples.

**Backend (.env):**
```env
PORT=5000
DATABASE_URL="file:./dev.db" # or PostgreSQL URL
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Database Setup
```bash
npm run db:migrate
npm run db:generate
npm run db:seed
```

### 4. Running the Application
- **Development**: `npm run dev` (Starts both frontend and backend)
- **Production (PM2)**: `npm run pm2`

## 🧪 Testing
```bash
npm test --prefix backend
```

## 📜 License
ISC
