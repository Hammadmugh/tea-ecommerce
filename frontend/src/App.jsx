import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import LandingPage from './pages/LandingPage'
import CollectionsPage from './pages/CollectionsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Footer from './components/Footer'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ProductManagement from './pages/admin/ProductManagement'
import InventoryManagement from './pages/admin/InventoryManagement'

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Signup Route */}
          <Route path="/signup" element={<SignupPage />} />

          {/* Checkout Route */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Public Routes */}
          <Route
            path="/*"
            element={
              <div className='flex flex-col min-h-screen max-w-[1400px] mx-auto'>
                <Navbar />
                <main className='flex-1 w-full'>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/collections" element={<CollectionsPage />} />
                    <Route path="/collections/:collection/:productName" element={<ProductDetailPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/inventory" element={<InventoryManagement />} />
                  </Routes>
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  )
}
export default App