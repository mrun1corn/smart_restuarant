# 🍽️ Smart Restaurant System — Full System Design Document

> **Type:** Web Application  
> **Author:** System Design  
> **Version:** 1.0  
> **Status:** Planning / Pre-Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [System Users & Roles](#3-system-users--roles)
4. [System Architecture](#4-system-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Data Models (Database Schema)](#6-data-models-database-schema)
7. [API Design](#7-api-design)
8. [Real-Time Communication](#8-real-time-communication)
9. [QR Code Flow](#9-qr-code-flow)
10. [Frontend — Customer Menu App](#10-frontend--customer-menu-app)
11. [Frontend — Receptionist Dashboard](#11-frontend--receptionist-dashboard)
12. [Frontend — Admin Panel](#12-frontend--admin-panel)
13. [Authentication & Authorization](#13-authentication--authorization)
14. [URL Structure & Routing](#14-url-structure--routing)
15. [Feature List](#15-feature-list)
16. [Development Phases & Milestones](#16-development-phases--milestones)
17. [Security Considerations](#17-security-considerations)
18. [Folder Structure](#18-folder-structure)
19. [Environment Variables](#19-environment-variables)
20. [Deployment Plan](#20-deployment-plan)
21. [Future Enhancements](#21-future-enhancements)
22. [Glossary](#22-glossary)

---

## 1. Project Overview

**Smart Restaurant System** is a full-stack web application that digitizes the restaurant ordering experience. Each table has a printed QR code. When a customer scans it, they are taken to a mobile-friendly menu where they can browse food items and place an order — with zero staff interaction needed at that step.

On the other side, a live receptionist/kitchen dashboard shows all incoming orders in real-time, organized by table. An admin panel allows full control over tables, menus, staff accounts, and QR codes.

### Core Surfaces

| Surface                | Who Uses It                | Access                      |
| ---------------------- | -------------------------- | --------------------------- |
| Customer Menu          | Customers                  | Public (via QR link)        |
| Receptionist Dashboard | Front-desk / Waiter staff  | Login required              |
| Admin Panel            | Restaurant owner / Manager | Login required (admin role) |

---

## 2. Goals & Success Metrics

### Goals

- Reduce time from seating to order placement
- Eliminate paper menus
- Give receptionists a real-time view of all table orders
- Let admins manage the entire system without touching code

### Success Metrics

- Customer can place an order within **60 seconds** of scanning QR
- New orders appear on dashboard within **2 seconds** (real-time)
- Zero page reload required on the dashboard for new orders
- Admin can add/edit/delete menu items in under **30 seconds**

---

## 3. System Users & Roles

### 3.1 Customer (Unauthenticated)

- Scans QR code on the table
- Views the menu
- Adds items to cart
- Places order
- Views order confirmation

### 3.2 Receptionist

- Logs into dashboard
- Views live orders per table
- Updates order status (Pending → Confirmed → Preparing → Served → Paid)
- Receives audio + visual alerts for new orders

### 3.3 Admin

- All receptionist permissions
- Manages tables (add, edit, delete, generate QR)
- Manages menu items (add, edit, delete, toggle availability)
- Manages staff accounts (add/remove receptionists)
- Views reports (optional Phase 3)

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│                                                             │
│   [ Customer Phone ]    [ Receptionist ]    [ Admin ]       │
│   (QR Scan → Menu)      (Dashboard)         (Panel)         │
└────────────┬─────────────────┬──────────────────┬──────────┘
             │                 │                  │
             └─────────────────┴──────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    BACKEND SERVER   │
                    │  (Node.js/Express)  │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │  REST API     │  │
                    │  │  /api/v1/...  │  │
                    │  └───────────────┘  │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │  WebSocket    │  │
                    │  │  (Socket.io)  │  │
                    │  └───────────────┘  │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │  Auth (JWT)   │  │
                    │  └───────────────┘  │
                    └──────────┬──────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
     ┌─────────▼──────────┐       ┌────────────▼────────────┐
     │    PostgreSQL DB    │       │   File / Image Storage  │
     │  (Primary storage) │       │  (Cloudinary or Local)  │
     └────────────────────┘       └─────────────────────────┘
```

### Why This Architecture?

- **REST API** handles all CRUD operations (menu, tables, orders)
- **WebSocket** pushes real-time order events to the receptionist dashboard
- **JWT Auth** secures all staff-facing routes
- **PostgreSQL** is relational — perfect for linked entities (order → table → items)

---

## 5. Tech Stack

### Backend

| Tool               | Purpose                           |
| ------------------ | --------------------------------- |
| **Node.js**        | Runtime                           |
| **Express.js**     | HTTP server + REST API            |
| **Socket.io**      | Real-time WebSocket communication |
| **PostgreSQL**     | Primary relational database       |
| **Prisma ORM**     | Database access and migrations    |
| **JWT**            | Authentication tokens             |
| **bcrypt**         | Password hashing                  |
| **qrcode** (npm)   | QR code image generation          |
| **Multer**         | File upload handling              |
| **Cloudinary SDK** | Image hosting (menu photos)       |
| **dotenv**         | Environment variable management   |

### Frontend

| Tool                 | Purpose                               |
| -------------------- | ------------------------------------- |
| **React** (Vite)     | UI framework                          |
| **React Router v6**  | Client-side routing                   |
| **Tailwind CSS**     | Styling                               |
| **Axios**            | HTTP requests                         |
| **Socket.io-client** | Real-time updates on dashboard        |
| **React Query**      | Server state management + caching     |
| **Zustand**          | Lightweight client state (cart, auth) |
| **React Hot Toast**  | Notifications                         |
| **Lucide React**     | Icons                                 |

### DevOps & Tooling

| Tool                  | Purpose                |
| --------------------- | ---------------------- |
| **Git + GitHub**      | Version control        |
| **Docker** (optional) | Containerization       |
| **Railway / Render**  | Hosting (backend + DB) |
| **Vercel / Netlify**  | Frontend hosting       |
| **Postman**           | API testing            |

---

## 6. Data Models (Database Schema)

### 6.1 Tables Table

```sql
CREATE TABLE restaurant_tables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number  INTEGER UNIQUE NOT NULL,
  qr_code_url   TEXT,
  status        VARCHAR(20) DEFAULT 'available',
    -- values: available | occupied | reserved
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### 6.2 Users (Staff)

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) DEFAULT 'receptionist',
    -- values: admin | receptionist
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### 6.3 Menu Categories

```sql
CREATE TABLE categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0
);
```

### 6.4 Menu Items

```sql
CREATE TABLE menu_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  name          VARCHAR(150) NOT NULL,
  description   TEXT,
  price         DECIMAL(10, 2) NOT NULL,
  image_url     TEXT,
  is_available  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### 6.5 Orders

```sql
CREATE TABLE orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id    UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  status      VARCHAR(30) DEFAULT 'pending',
    -- values: pending | confirmed | preparing | served | paid | cancelled
  note        TEXT,
  total_price DECIMAL(10, 2),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### 6.6 Order Items

```sql
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id  UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  unit_price    DECIMAL(10, 2) NOT NULL,
  note          TEXT
);
```

### Entity Relationship Diagram (ERD)

```
restaurant_tables ──< orders ──< order_items >── menu_items
                                                      │
                  categories ──────────────────────────┘

users (standalone — staff accounts)
```

---

## 7. API Design

**Base URL:** `https://yourapp.com/api/v1`

All protected routes require header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

### 7.1 Auth Endpoints

| Method | Endpoint       | Description                 | Auth |
| ------ | -------------- | --------------------------- | ---- |
| POST   | `/auth/login`  | Staff login, returns JWT    | ❌   |
| POST   | `/auth/logout` | Invalidate token (optional) | ✅   |
| GET    | `/auth/me`     | Get current user info       | ✅   |

**POST /auth/login — Request Body:**

```json
{
  "email": "staff@restaurant.com",
  "password": "secret123"
}
```

**Response:**

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "John",
    "role": "receptionist"
  }
}
```

---

### 7.2 Table Endpoints

| Method | Endpoint             | Description         | Auth     |
| ------ | -------------------- | ------------------- | -------- |
| GET    | `/tables`            | Get all tables      | ✅       |
| GET    | `/tables/:id`        | Get single table    | ✅       |
| POST   | `/tables`            | Create a table      | ✅ Admin |
| PUT    | `/tables/:id`        | Update table        | ✅ Admin |
| DELETE | `/tables/:id`        | Delete table        | ✅ Admin |
| GET    | `/tables/:id/qr`     | Download QR image   | ✅ Admin |
| PUT    | `/tables/:id/status` | Update table status | ✅       |

---

### 7.3 Menu Endpoints

| Method | Endpoint           | Description            | Auth     |
| ------ | ------------------ | ---------------------- | -------- |
| GET    | `/menu`            | Get all items (public) | ❌       |
| GET    | `/menu/:id`        | Get single item        | ❌       |
| POST   | `/menu`            | Create item            | ✅ Admin |
| PUT    | `/menu/:id`        | Update item            | ✅ Admin |
| DELETE | `/menu/:id`        | Delete item            | ✅ Admin |
| PATCH  | `/menu/:id/toggle` | Toggle availability    | ✅ Admin |

---

### 7.4 Category Endpoints

| Method | Endpoint          | Description         | Auth     |
| ------ | ----------------- | ------------------- | -------- |
| GET    | `/categories`     | List all categories | ❌       |
| POST   | `/categories`     | Create category     | ✅ Admin |
| PUT    | `/categories/:id` | Update category     | ✅ Admin |
| DELETE | `/categories/:id` | Delete category     | ✅ Admin |

---

### 7.5 Order Endpoints

| Method | Endpoint                 | Description                  | Auth |
| ------ | ------------------------ | ---------------------------- | ---- |
| POST   | `/orders`                | Place a new order (customer) | ❌   |
| GET    | `/orders`                | Get all orders               | ✅   |
| GET    | `/orders/:id`            | Get single order             | ✅   |
| GET    | `/orders/table/:tableId` | Get orders by table          | ✅   |
| PATCH  | `/orders/:id/status`     | Update order status          | ✅   |
| DELETE | `/orders/:id`            | Cancel order                 | ✅   |

**POST /orders — Request Body (Customer):**

```json
{
  "table_id": "uuid-of-table",
  "note": "No onions please",
  "items": [
    { "menu_item_id": "uuid", "quantity": 2, "note": "Extra spicy" },
    { "menu_item_id": "uuid", "quantity": 1, "note": "" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "order_id": "uuid",
  "message": "Order placed successfully"
}
```

---

### 7.6 User Management (Admin Only)

| Method | Endpoint     | Description          | Auth     |
| ------ | ------------ | -------------------- | -------- |
| GET    | `/users`     | List all staff       | ✅ Admin |
| POST   | `/users`     | Create staff account | ✅ Admin |
| PUT    | `/users/:id` | Update staff         | ✅ Admin |
| DELETE | `/users/:id` | Delete staff         | ✅ Admin |

---

## 8. Real-Time Communication

**Technology:** Socket.io (WebSocket with fallback to long polling)

### Events

#### Server → Client (Dashboard receives these)

| Event                  | Payload                | Description                  |
| ---------------------- | ---------------------- | ---------------------------- |
| `order:new`            | `{ order, table }`     | New order placed by customer |
| `order:updated`        | `{ order_id, status }` | Order status changed         |
| `order:cancelled`      | `{ order_id }`         | Order cancelled              |
| `table:status_changed` | `{ table_id, status }` | Table status updated         |

#### Client → Server (Dashboard sends these)

| Event            | Payload        | Description                  |
| ---------------- | -------------- | ---------------------------- |
| `join:dashboard` | `{}`           | Receptionist joins live room |
| `order:confirm`  | `{ order_id }` | Confirm a pending order      |

### Connection Flow

```
1. Receptionist logs in → opens Dashboard
2. Client connects to Socket.io → emits join:dashboard
3. Customer places order → POST /api/v1/orders
4. Server saves order → emits order:new to all dashboard clients
5. Dashboard shows notification + new order card instantly
6. Receptionist updates status → PATCH /api/v1/orders/:id/status
7. Server emits order:updated to all clients
```

### Backend Socket Setup (Example)

```javascript
// server.js
io.on("connection", (socket) => {
  socket.on("join:dashboard", () => {
    socket.join("dashboard-room");
  });
});

// In order controller, after saving order:
io.to("dashboard-room").emit("order:new", {
  order: savedOrder,
  table: tableInfo,
});
```

---

## 9. QR Code Flow

### Generation

1. Admin creates a table (e.g., Table 5)
2. Backend generates URL: `https://yourapp.com/menu/table/{table_id}`
3. Backend uses `qrcode` library to generate a PNG image of that URL
4. QR image is saved (locally or Cloudinary) and URL stored in DB
5. Admin downloads/prints the QR from the admin panel

### Customer Journey

```
Customer sits at Table 5
        ↓
Scans QR code with phone camera
        ↓
Browser opens: yourapp.com/menu/table/{table_id}
        ↓
Menu loads (table_id stored in React state / URL params)
        ↓
Customer browses, adds items to cart
        ↓
Taps "Place Order" → POST /api/v1/orders
        ↓
Order confirmation screen shown
        ↓
Receptionist dashboard gets real-time alert
```

### QR Code Generation (Node.js)

```javascript
const QRCode = require("qrcode");

async function generateQR(tableId) {
  const url = `${process.env.FRONTEND_URL}/menu/table/${tableId}`;
  const qrImageBuffer = await QRCode.toBuffer(url, {
    width: 400,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  // Save buffer to file or upload to Cloudinary
  return qrImageBuffer;
}
```

---

## 10. Frontend — Customer Menu App

### Pages

#### `/menu/table/:tableId`

- Verifies table exists (GET `/tables/:tableId`)
- Fetches menu items grouped by category
- Displays categories as tabs or sections
- Each item shows: image, name, description, price, "Add to Cart" button

#### Cart

- Slide-up cart drawer (not a separate page)
- Shows selected items, quantities, subtotal
- Customer can adjust quantities or remove items
- Optional: Add a note for the order
- "Place Order" button

#### `/order/success`

- Confirmation screen with order summary
- "Your order has been received!" message
- No login, no receipt email (Phase 1)

### UI/UX Guidelines

- **Mobile-first design** (most customers use phones)
- Minimum tap target: 44×44px
- Large food images, clean card layout
- Category filter tabs at the top (sticky)
- Loading skeletons instead of blank screens
- Prevent double-submit: disable button after first tap

---

## 11. Frontend — Receptionist Dashboard

### Pages

#### `/admin/login`

- Email + password form
- On success: save JWT to `localStorage`, redirect to `/admin/dashboard`

#### `/admin/dashboard`

- **Left panel:** Table overview grid (color-coded by status)
  - 🟢 Green = Available
  - 🟡 Yellow = Occupied / Has active order
  - 🔴 Red = Awaiting service
- **Right panel:** Active order cards
  - Grouped by table
  - Each card shows: table number, time placed, items list, total, current status
  - Status action buttons: Confirm → Preparing → Served → Paid
- **Top bar:** Notification bell, logged-in user name, logout

### Real-Time Behavior

- Connects to Socket.io on mount
- New order → toast notification + audio chime + new card appears
- Status update → card updates in place, no page reload

---

## 12. Frontend — Admin Panel

### Pages

#### `/admin/tables`

- Table list with table number, status, QR preview
- "Add Table" button → modal form (table number input)
- "Download QR" button per row
- "Regenerate QR" button per row
- "Delete Table" button (with confirmation modal)

#### `/admin/menu`

- Menu item list grouped by category
- "Add Item" → modal with fields: name, description, price, category, image upload, availability toggle
- Edit / Delete per item
- Toggle availability switch (quickly mark item as unavailable)

#### `/admin/categories`

- List of categories
- Add / Edit / Delete / Reorder

#### `/admin/users`

- Staff account list
- Add receptionist: name, email, password
- Edit / Deactivate / Delete accounts

---

## 13. Authentication & Authorization

### JWT Flow

```
1. Staff submits login form
2. Server verifies email + bcrypt.compare(password, hash)
3. Server signs JWT: { id, role, name } — expires in 8h
4. Client stores token in localStorage
5. All subsequent requests include: Authorization: Bearer <token>
6. Server middleware verifies token on every protected route
```

### Role-Based Access Control (RBAC)

```javascript
// middleware/auth.js
const verifyToken = (req, res, next) => { ... }

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Usage in routes:
router.post('/tables', verifyToken, requireAdmin, createTable);
router.get('/orders', verifyToken, getOrders); // receptionist + admin
```

### What Requires Auth

| Route                      | Who Can Access              |
| -------------------------- | --------------------------- |
| `POST /orders`             | Anyone (no auth — customer) |
| `GET /menu`                | Anyone (public)             |
| `GET /orders`              | Receptionist + Admin        |
| `PATCH /orders/:id/status` | Receptionist + Admin        |
| `POST /tables`             | Admin only                  |
| `POST /menu`               | Admin only                  |
| `POST /users`              | Admin only                  |

---

## 14. URL Structure & Routing

### Customer Routes (Public)

```
/menu/table/:tableId       → Menu page
/order/success             → Order confirmation
```

### Staff Routes (Protected)

```
/admin/login               → Login page
/admin/dashboard           → Live orders dashboard
/admin/tables              → Manage tables
/admin/menu                → Manage menu items
/admin/categories          → Manage categories
/admin/users               → Manage staff accounts
```

### API Routes

```
/api/v1/auth/...
/api/v1/tables/...
/api/v1/menu/...
/api/v1/categories/...
/api/v1/orders/...
/api/v1/users/...
```

---

## 15. Feature List

### Phase 1 — MVP

- [x] Customer can scan QR and view menu
- [x] Customer can add items to cart and place order
- [x] Receptionist can see orders in real-time
- [x] Receptionist can update order status
- [x] Admin can manage tables
- [x] Admin can manage menu items
- [x] QR code generation and download
- [x] Staff login with JWT

### Phase 2 — Enhanced

- [ ] Audio alert on new order
- [ ] Table status color coding
- [ ] Order history / archive
- [ ] Filter orders by status
- [ ] Item-level notes from customer
- [ ] Role-based route guards on frontend

### Phase 3 — Advanced

- [ ] Bill/receipt PDF generation
- [ ] Daily sales report
- [ ] Multiple restaurant branches support
- [ ] Kitchen display screen (separate view for kitchen staff)
- [ ] Customer can call waiter via button
- [ ] Menu item ratings / feedback

---

## 16. Development Phases & Milestones

### Phase 1 — Foundation (Week 1–2)

- [ ] Set up backend project (Node + Express + Prisma)
- [ ] Create PostgreSQL database and run migrations
- [ ] Implement auth endpoints (login, JWT middleware)
- [ ] Build Table, MenuItem, Order APIs
- [ ] Set up React frontend project (Vite + Tailwind)
- [ ] Build customer menu page
- [ ] Build cart and order placement flow

### Phase 2 — Dashboard & Real-Time (Week 3)

- [ ] Integrate Socket.io on backend
- [ ] Build receptionist dashboard
- [ ] Live order cards with status update
- [ ] Connect Socket.io client on frontend
- [ ] New order notification + audio alert

### Phase 3 — Admin Panel (Week 4)

- [ ] Table management UI (CRUD + QR download)
- [ ] Menu management UI (CRUD + image upload)
- [ ] Staff management UI
- [ ] Role-based access control (frontend + backend)

### Phase 4 — Polish & Deploy (Week 5)

- [ ] Mobile responsiveness audit
- [ ] Error handling and loading states
- [ ] Form validations
- [ ] Environment-based configs
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel
- [ ] End-to-end testing

---

## 17. Security Considerations

| Risk                                       | Mitigation                                              |
| ------------------------------------------ | ------------------------------------------------------- |
| Customer ordering from home using saved QR | Add session token or expiry to QR URL (Phase 2)         |
| SQL injection                              | Use Prisma ORM (parameterized queries)                  |
| Brute-force login                          | Rate limiting with `express-rate-limit`                 |
| Password exposure                          | Hash with `bcrypt` (saltRounds: 12)                     |
| JWT token theft                            | Short expiry (8h), HTTPS only                           |
| Double order submission                    | Disable submit button after click, idempotency key      |
| Unauthorized API access                    | JWT middleware on all protected routes                  |
| XSS attacks                                | Sanitize all user input, use React (escapes by default) |
| Mass item delete                           | Confirm dialogs + soft delete pattern                   |

---

## 18. Folder Structure

### Backend

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── table.controller.js
│   │   ├── menu.controller.js
│   │   ├── order.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.js           ← JWT verification
│   │   ├── role.js           ← RBAC check
│   │   └── upload.js         ← Multer config
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── table.routes.js
│   │   ├── menu.routes.js
│   │   ├── order.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── qr.service.js     ← QR generation logic
│   │   └── socket.service.js ← Socket.io emitters
│   ├── prisma/
│   │   └── schema.prisma
│   ├── app.js
│   └── server.js
├── .env
├── package.json
└── README.md
```

### Frontend

```
frontend/
├── src/
│   ├── pages/
│   │   ├── customer/
│   │   │   ├── MenuPage.jsx
│   │   │   └── OrderSuccess.jsx
│   │   └── admin/
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── TablesPage.jsx
│   │       ├── MenuManagePage.jsx
│   │       └── UsersPage.jsx
│   ├── components/
│   │   ├── customer/
│   │   │   ├── MenuCard.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   └── CategoryTabs.jsx
│   │   └── admin/
│   │       ├── OrderCard.jsx
│   │       ├── TableGrid.jsx
│   │       ├── Sidebar.jsx
│   │       └── Modals/
│   ├── hooks/
│   │   ├── useSocket.js
│   │   ├── useCart.js
│   │   └── useAuth.js
│   ├── store/
│   │   ├── cartStore.js      ← Zustand
│   │   └── authStore.js      ← Zustand
│   ├── api/
│   │   ├── axiosClient.js    ← Base Axios setup
│   │   ├── menu.api.js
│   │   ├── order.api.js
│   │   └── table.api.js
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── README.md
```

---

## 19. Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smart_restaurant

# JWT
JWT_SECRET=your_very_strong_secret_here
JWT_EXPIRES_IN=8h

# Frontend URL (for QR code generation)
FRONTEND_URL=https://yourapp.com

# Cloudinary (image upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env`

```env
VITE_API_BASE_URL=https://api.yourapp.com/api/v1
VITE_SOCKET_URL=https://api.yourapp.com
```

---

## 20. Deployment Plan

### Backend — Railway or Render

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add environment variables in dashboard
4. Provision a PostgreSQL database on the platform
5. Run `prisma migrate deploy` on first deploy
6. Enable automatic deploys on push to `main`

### Frontend — Vercel

1. Push frontend to GitHub
2. Import project in Vercel
3. Set `VITE_API_BASE_URL` and `VITE_SOCKET_URL` env vars
4. Deploy — automatic on push to `main`

### Domain Setup (Optional)

```
yourapp.com           → Frontend (Vercel)
api.yourapp.com       → Backend (Railway/Render)
```

Configure CORS on backend:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
```

---

## 21. Future Enhancements

| Feature                    | Description                                                                      |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Kitchen Display Screen** | Separate read-only view for kitchen staff showing only item names and quantities |
| **Bill / Receipt**         | PDF receipt generation when order is marked Paid                                 |
| **Multi-branch Support**   | One admin account managing multiple restaurant locations                         |
| **Analytics Dashboard**    | Daily sales, most ordered items, peak hours chart                                |
| **Customer Feedback**      | After order served, customer can rate the meal via QR                            |
| **Waiter Call Button**     | Customer taps "Call Waiter" from menu page → notification on dashboard           |
| **Inventory Tracking**     | Track stock levels, auto-disable items when out of stock                         |
| **Loyalty / QR Rewards**   | Customer scans = loyalty points tracked by phone number                          |
| **Multi-language Menu**    | Menu displayed in customer's browser language                                    |

---

## 22. Glossary

| Term            | Definition                                                             |
| --------------- | ---------------------------------------------------------------------- |
| **QR Code**     | Quick Response code — a 2D barcode that encodes a URL                  |
| **JWT**         | JSON Web Token — a signed token used for authentication                |
| **WebSocket**   | Protocol for persistent, two-way real-time communication               |
| **Socket.io**   | Library that wraps WebSocket with fallback support                     |
| **ORM**         | Object-Relational Mapper — maps database tables to code objects        |
| **Prisma**      | ORM for Node.js with type-safe database access                         |
| **RBAC**        | Role-Based Access Control — restricting access based on user role      |
| **REST API**    | Representational State Transfer — HTTP-based API design style          |
| **CRUD**        | Create, Read, Update, Delete — the four basic database operations      |
| **Idempotency** | Property where repeated identical requests have the same effect as one |
| **SSE**         | Server-Sent Events — one-way real-time push from server to browser     |

---

_Document last updated: 2026_  
_Version: 1.0 — Smart Restaurant System Design_
