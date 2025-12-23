import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import BrowseJobsPage from './pages/jobs/BrowseJobsPage';
import JobDetailsPage from './pages/jobs/JobDetailsPage';
import PostJobPage from './pages/jobs/PostJobPage';
import MyJobsPage from './pages/jobs/MyJobsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Jobs - All Users */}
            <Route path="/jobs" element={<BrowseJobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            
            {/* Jobs - Recruiters Only */}
            <Route 
              path="/jobs/new" 
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <PostJobPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs/manage" 
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <MyJobsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Placeholder routes */}
            <Route path="/applications" element={<div className="card">Applications - Coming Soon</div>} />
            <Route path="/profile" element={<div className="card">Profile - Coming Soon</div>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
