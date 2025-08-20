import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from 'styled-components';

// Page imports
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentManagement from './pages/StudentManagement';
import StudentEnrollment from './pages/StudentEnrollment';
import AttendanceManagement from './pages/AttendanceManagement';
import FeeManagement from './pages/FeeManagement';
import AdminTeachers from './pages/AdminTeachers';
import TeacherGrades from './pages/TeacherGrades';
import SubjectManagement from './components/SubjectManagement';

// Context and styles
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/global.css';

// Theme configuration
const theme = {
  colors: {
    primary: '#722F37', // Wine color
    secondary: '#FFFFFF', // White
    accent: '#8B3D47', // Darker wine
    lightWine: '#A0525D', // Lighter wine
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    borderColor: '#dee2e6',
    backgroundLight: '#f8f9fa',
  },
  shadows: {
    small: '0 2px 4px rgba(114, 47, 55, 0.1)',
    medium: '0 4px 8px rgba(114, 47, 55, 0.15)',
    large: '0 8px 16px rgba(114, 47, 55, 0.2)',
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px',
    largeDesktop: '1200px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
  },
  typography: {
    fontFamily: "'Poppins', 'Inter', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '32px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Query Client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected Teacher Routes */}
                <Route 
                  path="/teacher" 
                  element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Student Management Routes */}
                <Route 
                  path="/students" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                      <StudentManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/students/add" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <StudentEnrollment />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/students/:id" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                      <StudentManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/students/:id/edit" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <StudentEnrollment />
                    </ProtectedRoute>
                  } 
                />
                
                                        {/* Attendance Management Routes */}
                        <Route
                          path="/attendance"
                          element={
                            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                              <AttendanceManagement />
                            </ProtectedRoute>
                          }
                        />

                        {/* Fee Management Routes */}
                        <Route
                          path="/fees"
                          element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <FeeManagement />
                            </ProtectedRoute>
                          }
                        />

                        {/* Teacher Management Routes */}
                        <Route
                          path="/admin/teachers"
                          element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <AdminTeachers />
                            </ProtectedRoute>
                          }
                        />

                        {/* Subject Management Routes */}
                        <Route
                          path="/subjects"
                          element={
                            <ProtectedRoute allowedRoles={['admin']}>
                              <SubjectManagement />
                            </ProtectedRoute>
                          }
                        />

                        {/* Teacher Grade Management Routes */}
                        <Route
                          path="/teacher/grades"
                          element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                              <TeacherGrades />
                            </ProtectedRoute>
                          }
                        />

                        {/* Default Routes */}
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
              
              {/* Toast Container for notifications */}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastStyle={{
                  backgroundColor: '#FFFFFF',
                  color: '#212529',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(114, 47, 55, 0.15)',
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
