//Project Logic-i src/App.js

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';
import PropTypes from 'prop-types';

//Backend URL
import { BACKEND_URL } from './config/api';
window.BACKEND_URL = BACKEND_URL;

// Public Components
import HeroSection from './components/HeroSection/HeroSection';
import SecondSection from './components/SecondSection/SecondSection';
import ThirdSection from './components/ThirdSection/ThirdSection';
import FourthSection from './components/FourthSection/FourthSection';
import FifthSection from './components/FifthSection/FifthSection';
import Footer from './components/Footer/Footer';
import WarehouseSolution from './pages/WarehouseSolutions';
import TermsOfService from './components/ToS/ToS';
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy';
import AuthCallback from './components/Login/AuthCallback';

// User Components
import UserLayout from './layouts/userlayout/UserLayout';
import Dashboard from './components/user/dashboard/Dashboard';
import {
  WarehouseList,
  WarehouseForm,
  WarehouseDetail,
} from './components/user/warehouses';
import PartnerInquiries from './components/user/inquiries/PartnerInquiries';
import BookingManagement from './components/user/bookings/BookingManagement';
import UserProfile from './components/user/profile';
import WarehouseDetails from './components/WarehouseSolution/WarehouseDetails/WarehouseDetails';
//Admin Components
import AdminLayout from './layouts/adminlayout/AdminLayout';
import AdminLogin from './components/admin/login/AdminLogin';
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import AdminUserPanel from './components/admin/AdminUsers/AdminUserPanel';
import PendingWarehouses from './components/admin/warehouses/PendingWarehouses';
import AdminWarehouses from './components/admin/warehouses/AdminWarehouses';
import AdminProtectedRoute from './components/admin/common/AdminProtectedRoute';
import CreateAdmin from './components/admin/createAdmin/createAdmin';
import ManageUsers from './components/admin/manageUsers/ManageUsers';
import AdminInquiries from './components/admin/inquiries/AdminInquiries';
import AdminContacts from './components/admin/contacts/AdminContacts';
import AdminBookingManagement from './components/admin/bookings/AdminBookingManagement';
import PaymentSuccess from './components/Payment/PaymentSuccess';
import PaymentFailure from './components/Payment/PaymentFailure';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  const location = useLocation();

  if (!token) {
    // Clear any remaining auth data
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Store the intended destination URL
    sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    return <Navigate to="/?showLogin=true" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <ErrorBoundary>
          <AuthProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <HeroSection />
                    <SecondSection />
                    <ThirdSection />
                    <FourthSection />
                    <FifthSection />
                    <Footer />
                  </>
                }
              />
              <Route path="/auth/success" element={<AuthCallback />} />
              <Route
                path="/WarehouseSolution"
                element={
                  <>
                    <WarehouseSolution />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/warehouse-details/:id"
                element={
                  <>
                    <Navbar />
                     <WarehouseDetails/>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/warehouse/:id"
                element={
                  <>
                    <Navbar />
                     <WarehouseDetails/>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/terms-of-service"
                element={
                  <>
                    <Navbar />
                    <TermsOfService />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/privacy-policy"
                element={
                  <>
                    <Navbar />
                    <PrivacyPolicy />
                    <Footer />
                  </>
                }
              />
               {/* Payment routes */}
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failure" element={<PaymentFailure />} />
              {/* User Routes */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="warehouses">
                  <Route index element={<WarehouseList />} />
                  <Route path="new" element={<WarehouseForm />} />
                  <Route path=":id" element={<WarehouseDetail />} />
                  <Route path=":id/edit" element={<WarehouseForm />} />
                </Route>
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="inquiries" element={<PartnerInquiries />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>
              {/* Admin Login Route */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="admin-users" element={<AdminUserPanel />} />
                <Route path="warehouses">
                  <Route index element={<AdminWarehouses />} />
                  <Route path="pending" element={<PendingWarehouses />} />
                </Route>
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="contacts" element={<AdminContacts />} />
                <Route path="bookings" element={<AdminBookingManagement />} />
                <Route path="create-admin" element={<CreateAdmin />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="users" element={<ManageUsers />} />
              </Route>
              {/* Error Routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AuthProvider>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default App;
