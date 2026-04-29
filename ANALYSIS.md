# Smart Restaurant System - Architectural Map (Graphify)

## 1. System Components

### Frontend (React + Vite)
- **State Management:** `zustand` (`authStore`, `cartStore`)
- **Data Fetching:** `@tanstack/react-query`
- **Routing:** `react-router-dom`
- **Real-time:** `socket.io-client` (via `useSocket` hook)
- **Styling:** `tailwindcss` v4

#### Pages & Features
- **Customer App:**
  - `MenuPage`: Display items by category, add to cart.
  - `OrderSuccess`: Confirmation after ordering.
- **Staff/Admin Panel:**
  - `LoginPage`: Authentication.
  - `DashboardPage`: Real-time order tracking.
  - `TablesPage`: Table management & QR generation.
  - `MenuManagePage`: Menu item CRUD.
  - `CategoriesPage`: Category CRUD.
  - `UsersPage`: Staff management.
  - `ReportsPage`: Sales/Order analytics.

### Backend (Node.js + Express)
- **Database ORM:** `Prisma` (SQLite)
- **Real-time:** `socket.io`
- **Validation:** `zod`
- **Image Storage:** `Cloudinary` (via `multer`)
- **Auth:** `bcrypt`, `jsonwebtoken`

#### Key Modules (Controllers & Routes)
- `auth`: Login, registration, token verification.
- `table`: Table CRUD, QR code generation.
- `menu`: Menu item CRUD with image upload.
- `category`: Category grouping.
- `order`: Placement, status updates, real-time broadcasts.
- `report`: Aggregated sales data.
- `user`: Management of staff accounts.

## 2. Data Model Relationships (ERD)

- **User**: (id, name, email, passwordHash, role, isActive)
- **RestaurantTable** (1) <--- (N) **Order**
- **Category** (1) <--- (N) **MenuItem**
- **MenuItem** (1) <--- (N) **OrderItem**
- **Order** (1) <--- (N) **OrderItem**

## 3. Real-Time Data Flow
1. Customer places order (`POST /api/orders`).
2. Backend saves order to DB.
3. Backend emits `new_order` event via Socket.io.
4. Receptionist Dashboard (listening via `useSocket`) receives event.
5. Dashboard updates order list and plays notification sound.

## 4. Environment Dependencies
- `DATABASE_URL`: Prisma connection string.
- `JWT_SECRET`: Security for staff tokens.
- `CLOUDINARY_URL`: Asset management.
- `FRONTEND_URL`: For QR code generation logic.
