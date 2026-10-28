import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { RegisterDonor } from './pages/RegisterDonor';
import { RegisterRecipient } from './pages/RegisterRecipient';
import { BrowseListings } from './pages/BrowseListings';
import { ListingDetail } from './pages/ListingDetail';
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { CreateListing } from './pages/donor/CreateListing';
import { RecipientDashboard } from './pages/recipient/RecipientDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Profile } from './pages/Profile';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register/donor" element={<RegisterDonor />} />
              <Route path="/register/recipient" element={<RegisterRecipient />} />
              <Route path="/listings" element={<BrowseListings />} />
              <Route path="/listings/:id" element={<ListingDetail />} />

              {/* Donor Routes */}
              <Route
                path="/donor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/create"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <CreateListing />
                  </ProtectedRoute>
                }
              />

              {/* Recipient Routes */}
              <Route
                path="/recipient/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RECIPIENT', 'ADMIN']}>
                    <RecipientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
