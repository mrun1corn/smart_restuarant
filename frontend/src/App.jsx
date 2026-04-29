import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.js';

// Layouts
import AdminLayout from './components/admin/AdminLayout.jsx';

// Customer Pages
import MenuPage from './pages/customer/MenuPage.jsx';
import OrderSuccess from './pages/customer/OrderSuccess.jsx';

// Admin Pages
import LoginPage from './pages/admin/LoginPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import TablesPage from './pages/admin/TablesPage.jsx';
import MenuManagePage from './pages/admin/MenuManagePage.jsx';
import CategoriesPage from './pages/admin/CategoriesPage.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, token } = useAuthStore();
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Customer Routes */}
        <Route path="/menu/table/:tableId" element={<MenuPage />} />
        <Route path="/order/success" element={<OrderSuccess />} />
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tables" element={<ProtectedRoute requireAdmin={true}><TablesPage /></ProtectedRoute>} />
          <Route path="menu" element={<ProtectedRoute requireAdmin={true}><MenuManagePage /></ProtectedRoute>} />
          <Route path="categories" element={<ProtectedRoute requireAdmin={true}><CategoriesPage /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute requireAdmin={true}><UsersPage /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute requireAdmin={true}><ReportsPage /></ProtectedRoute>} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
