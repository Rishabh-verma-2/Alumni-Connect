import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './darkmode.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import ScrollToTop from './Shared/components/ScrollToTop';
import LogoutOverlay from './Shared/components/LogoutOverlay';
import LandingPage from './Auth/pages/LandingPage';
import SignupPage from './Auth/pages/SignupPage';
import LoginPage from './Auth/pages/LoginPage';
import ForgotPasswordPage from './Auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './Auth/pages/ResetPasswordPage';
import ContactPage from './Auth/pages/ContactPage';
import AlumniNetworkPage from './Shared/pages/AlumniNetworkPage';
import SuccessStoriesPage from './Shared/pages/SuccessStoriesPage';
import AboutPage from './Shared/pages/AboutPage';
import StudentDashboard from './Student/pages/StudentDashboard';
import StudentProfile from './Student/pages/StudentProfile';
import MyConnections from './Student/pages/MyConnections';
import Messages from './Student/pages/Messages';
import BrowseAlumni from './Student/pages/BrowseAlumni';
import EventsPage from './Student/pages/EventsPage';
import EventGallery from './Student/pages/EventGallery';
import Posts from './Shared/components/Posts';
import AlumniDashboard from './Alumni/pages/AlumniDashboard';
import AlumniProfile from './Alumni/pages/AlumniProfile';
import AlumniProfileView from './Alumni/pages/AlumniProfileView';
import AlumniList from './Alumni/pages/AlumniList';
import SettingsPage from './Shared/pages/SettingsPage';
import Settings from './Shared/pages/Settings';
import OTPVerificationPage from './Auth/pages/OTPVerificationPage';
import PublicRoute from './Auth/components/PublicRoute';
import ProtectedRoute from './Auth/components/ProtectedRoute';
import AdminDashboard from './Admin/pages/AdminDashboard';
import AdminUsers from './Admin/pages/AdminUsers';
import AdminAlumni from './Admin/pages/AdminAlumni';
import AdminStudents from './Admin/pages/AdminStudents';
import AdminAnalytics from './Admin/pages/AdminAnalytics';
import AdminLogs from './Admin/pages/AdminLogs';
import AdminSettings from './Admin/pages/AdminSettings';

// Role-based route component
const RoleBasedRoute = ({ children, allowedRoles, requireVerification = false }) => {
  const { user, loading, loggingOut } = useAuth();
  const token = localStorage.getItem('token');

  if (loading || loggingOut) {
    return <div className="min-h-screen flex items-center justify-center"><div className="loading loading-spinner loading-lg"></div></div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (requireVerification && !user.isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  return children;
};

// Logout overlay wrapper component
const LogoutOverlayWrapper = () => {
  const { loggingOut } = useAuth();
  return loggingOut ? <LogoutOverlay /> : null;
};

// Main App component with route wrapper
const AppRoutes = () => {
  const { user, loggingOut } = useAuth();
  const token = localStorage.getItem('token');

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student': return '/student-dashboard';
      case 'alumni': return '/alumni-dashboard';
      case 'faculty': return '/faculty-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/student-dashboard';
    }
  };

  return (
    <Routes>
      {/* Redirect root based on auth status */}
      <Route path="/" element={
        (token && !loggingOut) ? <Navigate to={getDashboardRoute()} replace /> : <LandingPage />
      } />

      {/* Public routes - redirect to dashboard if logged in */}
      <Route path="/signup" element={
        <PublicRoute><SignupPage /></PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute><ForgotPasswordPage /></PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute><ResetPasswordPage /></PublicRoute>
      } />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/alumni-network" element={<AlumniNetworkPage />} />
      <Route path="/success-stories" element={<SuccessStoriesPage />} />

      {/* OTP Verification - accessible to users with token */}
      <Route path="/verify-otp" element={
        token ? <OTPVerificationPage /> : <Navigate to="/login" replace />
      } />

      {/* Student routes - only for students */}
      <Route path="/student-dashboard" element={
        <RoleBasedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </RoleBasedRoute>
      } />
      <Route path="/student-profile" element={
        <RoleBasedRoute allowedRoles={['student']}>
          <StudentProfile />
        </RoleBasedRoute>
      } />
      <Route path="/my-connections" element={
        <RoleBasedRoute allowedRoles={['student']}>
          <MyConnections />
        </RoleBasedRoute>
      } />
      <Route path="/messages" element={
        <RoleBasedRoute allowedRoles={['student', 'alumni']}>
          <Messages />
        </RoleBasedRoute>
      } />
      <Route path="/browse-alumni" element={
        <RoleBasedRoute allowedRoles={['student']}>
          <BrowseAlumni />
        </RoleBasedRoute>
      } />
      <Route path="/alumni-profile-view/:id" element={
        <RoleBasedRoute allowedRoles={['student']}>
          <AlumniProfileView />
        </RoleBasedRoute>
      } />
      <Route path="/events" element={
        <RoleBasedRoute allowedRoles={['student']}>
          <EventsPage />
        </RoleBasedRoute>
      } />
      <Route path="/posts" element={
        <RoleBasedRoute allowedRoles={['student', 'alumni']}>
          <Posts />
        </RoleBasedRoute>
      } />
      <Route path="/events/gallery/:eventId" element={
        <RoleBasedRoute allowedRoles={['student']}>
          <EventGallery />
        </RoleBasedRoute>
      } />
      <Route path="/settings" element={
        <RoleBasedRoute allowedRoles={['student']}>
          <SettingsPage />
        </RoleBasedRoute>
      } />

      {/* Alumni routes - only for alumni */}
      <Route path="/alumni-dashboard" element={
        <RoleBasedRoute allowedRoles={['alumni']}>
          <AlumniDashboard />
        </RoleBasedRoute>
      } />
      <Route path="/alumni-profile" element={
        <RoleBasedRoute allowedRoles={['alumni']}>
          <AlumniProfile />
        </RoleBasedRoute>
      } />
      <Route path="/alumni-list" element={
        <RoleBasedRoute allowedRoles={['student', 'alumni', 'faculty', 'admin']}>
          <AlumniList />
        </RoleBasedRoute>
      } />
      <Route path="/alumni-settings" element={
        <RoleBasedRoute allowedRoles={['alumni']}>
          <Settings />
        </RoleBasedRoute>
      } />

      {/* Faculty routes - only for faculty */}
      <Route path="/faculty-dashboard" element={
        <RoleBasedRoute allowedRoles={['faculty']}>
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl">Faculty Dashboard - Coming Soon</h1>
          </div>
        </RoleBasedRoute>
      } />

      {/* Admin routes - only for admin */}
      <Route path="/admin-dashboard" element={
        <RoleBasedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </RoleBasedRoute>
      } />
      <Route path="/admin-users" element={
        <RoleBasedRoute allowedRoles={['admin']}>
          <AdminUsers />
        </RoleBasedRoute>
      } />
      <Route path="/admin-alumni" element={
        <RoleBasedRoute allowedRoles={['admin']}>
          <AdminAlumni />
        </RoleBasedRoute>
      } />
      <Route path="/admin-students" element={
        <RoleBasedRoute allowedRoles={['admin']}>
          <AdminStudents />
        </RoleBasedRoute>
      } />
      <Route path="/admin-analytics" element={
        <RoleBasedRoute allowedRoles={['admin']}>
          <AdminAnalytics />
        </RoleBasedRoute>
      } />
      <Route path="/admin-logs" element={
        <RoleBasedRoute allowedRoles={['admin']}>
          <AdminLogs />
        </RoleBasedRoute>
      } />
      <Route path="/admin-settings" element={
        <RoleBasedRoute allowedRoles={['admin']}>
          <AdminSettings />
        </RoleBasedRoute>
      } />

      {/* Catch all - redirect to appropriate dashboard */}
      <Route path="*" element={
        token ? <Navigate to={getDashboardRoute()} replace /> : <Navigate to="/" replace />
      } />
    </Routes>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <ScrollToTop />
            <AppRoutes />
            <LogoutOverlayWrapper />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1F2937',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                },
                success: {
                  style: {
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                  },
                  iconTheme: {
                    primary: 'white',
                    secondary: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  },
                  iconTheme: {
                    primary: 'white',
                    secondary: '#EF4444',
                  },
                },
                loading: {
                  style: {
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  },
                },
              }}
            />
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;