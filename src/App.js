import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import BrowseACs from './pages/BrowseACs';
import ACDetail from './pages/ACDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import ServiceRequest from './pages/user/ServiceRequest';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddAC from './pages/admin/AddAC';
import AddWashingMachine from './pages/admin/AddWashingMachine';
import AddRefrigerator from './pages/admin/AddRefrigerator';
import ManageACs from './pages/admin/ManageACs';
import ManageProducts from './pages/admin/ManageProducts';
import Leads from './pages/admin/Leads';
import ManageServices from './pages/admin/ManageServices';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LegalPage from './pages/LegalPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CancellationRefundPage from './pages/CancellationRefundPage';
import DeliveryServicePage from './pages/DeliveryServicePage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <CartProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow pt-16 md:pt-20">
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<BrowseACs />} />
              <Route path="/ac/:id" element={<ACDetail />} />
              <Route path="/washing-machine/:id" element={<ProductDetail />} />
              <Route path="/refrigerator/:id" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal/terms-and-conditions" element={<TermsConditionsPage />} />
              <Route path="/legal/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/legal/cancellation-refund" element={<CancellationRefundPage />} />
              <Route path="/legal/delivery-service" element={<DeliveryServicePage />} />
              <Route path="/legal/shipping-policy" element={<ShippingPolicyPage />} />
              <Route path="/legal/:docId" element={<LegalPage />} />
              <Route path="/service-request" element={<ServiceRequest />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin-login" element={<Login />} />

              {/* User Protected Routes */}
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute redirectTo="/login">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute redirectTo="/login">
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute redirectTo="/login">
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute redirectTo="/login">
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-ac"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddAC />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-washing-machine"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddWashingMachine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-refrigerator"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddRefrigerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-acs"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ManageACs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-products"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ManageProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leads"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-services"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ManageServices />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
        </CartProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
