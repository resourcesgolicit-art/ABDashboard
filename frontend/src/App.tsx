// src/App.tsx

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import ExploreCourses from './pages/ExploreCourses';
import PaymentHistory from './pages/PaymentHistory';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import ProfileSetup from './pages/ProfileSetup';

import CourseReader from './pages/CourseReader';
import CourseDetail from './pages/CourseDetail';
import EmailVerification from './pages/EmailVerification';

const queryClient = new QueryClient();

// Redirect root → /dashboard if logged in OR /auth if not
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  return user ? (
    <Navigate to='/dashboard' replace />
  ) : (
    <Navigate to='/auth' replace />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              {/* Default */}
              <Route path='/' element={<RootRedirect />} />

              {/* Auth */}
              <Route path='/auth' element={<Auth />} />

              {/* Protected Dashboard Routes */}
              <Route
                path='/dashboard'
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />

                <Route path='profile-setup' element={<ProfileSetup />} />

                <Route path='my-courses' element={<MyCourses />} />
                <Route path='explore' element={<ExploreCourses />} />

                <Route path='payments' element={<PaymentHistory />} />
                <Route path='profile' element={<Profile />} />
                <Route
                  path='email-verification'
                  element={<EmailVerification />}
                />

                {/* COURSE DETAIL (optional page) */}
                <Route
                  path='course-detail/:courseId'
                  element={<CourseDetail />}
                />

                {/* MAIN COURSE READER PAGE */}
                <Route path='course/:courseId' element={<CourseReader />} />
              </Route>

              {/* Not Found */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
