import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { NotificationBanner } from './components/NotificationBanner';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public & Passenger Pages
import { LandingPage } from './pages/LandingPage';
import { RoutePlannerPage } from './pages/passenger/RoutePlannerPage';
import { CrowdMapPage } from './pages/passenger/CrowdMapPage';
import { CrowdTimingsPage } from './pages/passenger/CrowdTimingsPage';
import { ReportCrowdPage } from './pages/passenger/ReportCrowdPage';
import { SavedRoutesPage } from './pages/passenger/SavedRoutesPage';
import { PassengerDashboard } from './pages/passenger/PassengerDashboard';
import { PassengerProfilePage } from './pages/passenger/PassengerProfilePage';
import { LiveRailRadarPage } from './pages/passenger/LiveRailRadarPage';

// Authentication Pages
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TransportManagementPage } from './pages/admin/TransportManagementPage';
import { CrowdMonitoringPage } from './pages/admin/CrowdMonitoringPage';
import { CrowdAnalyticsPage } from './pages/admin/CrowdAnalyticsPage';
import { PassengerReportsPage } from './pages/admin/PassengerReportsPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// 404
import { NotFoundPage } from './pages/NotFoundPage';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex-1 flex flex-col"
      >
        <Routes location={location} key={location.pathname}>
          {/* Public Discovery Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/routes" element={<RoutePlannerPage />} />
          <Route path="/map" element={<CrowdMapPage />} />
          <Route path="/railradar" element={<LiveRailRadarPage />} />
          <Route path="/live-trains" element={<LiveRailRadarPage />} />
          <Route path="/timings" element={<CrowdTimingsPage />} />
          <Route path="/report" element={<ReportCrowdPage />} />

          {/* Dedicated Authentication Routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />

          {/* Passenger Portal Routes */}
          <Route
            path="/passenger"
            element={
              <ProtectedRoute allowedRole="passenger">
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute allowedRole="passenger">
                <SavedRoutesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRole="passenger">
                <PassengerProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Operations Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transport"
            element={
              <ProtectedRoute allowedRole="admin">
                <TransportManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/crowd"
            element={
              <ProtectedRoute allowedRole="admin">
                <CrowdMonitoringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRole="admin">
                <CrowdAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRole="admin">
                <PassengerReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRole="admin">
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-transit-bg text-transit-navy">
          <NotificationBanner />
          <Navbar />

          <main className="flex-1 flex flex-col">
            <AnimatedRoutes />
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

