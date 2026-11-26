

import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { CartPage } from '../pages/CartPage';
import { ProfilePage } from '../pages/ProfilePage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { AdminRoute } from '../components/routing/AdminRoute';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute><FavoritesPage /></ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute><MyOrdersPage /></ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute><CartPage /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute><AdminLayout /></AdminRoute>
      }>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
      </Route>
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};