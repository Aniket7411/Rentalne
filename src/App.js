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
import ResetPassword from './pages/ResetPassword';
import FaqPage from './pages/FaqPage';

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
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminFaqs from './pages/admin/AdminFaqs';
import AdminTickets from './pages/admin/AdminTickets';
import AdminServiceRequests from './pages/admin/AdminServiceRequests';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorAddAC from './pages/vendor/AddAC';
import VendorManageACs from './pages/vendor/ManageACs';
import VendorLeads from './pages/vendor/Leads';
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
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/faq" element={<FaqPage />} />
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
              {/* Cart / checkout: guests can use local cart; payment requires login (see CheckoutPage). */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute redirectTo="/login">
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Vendor (role === vendor) — UI uses mock API in services/dummyData.js; wire to backend when vendor APIs are finalized */}
              <Route
                path="/vendor/dashboard"
                element={
                  <ProtectedRoute requireVendor>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/add-ac"
                element={
                  <ProtectedRoute requireVendor>
                    <VendorAddAC />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/manage-acs"
                element={
                  <ProtectedRoute requireVendor>
                    <VendorManageACs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/leads"
                element={
                  <ProtectedRoute requireVendor>
                    <VendorLeads />
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
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coupons"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminCoupons />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/faqs"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminFaqs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tickets"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/service-requests"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminServiceRequests />
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
