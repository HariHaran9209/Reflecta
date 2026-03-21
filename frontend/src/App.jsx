import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Login from './components/Login'
import Register from './components/Register'
import AdminDashboard from './components/AdminDashboard'
import BossDashboard from './components/BossDashboard'
import Questions from './components/Questions'
import './css/App.css'

function AppRoutes() {
  const { isAuthenticated, canAccessBoss, canAccessAdmin, canAccessStudent } = useAuth()
  const location = window.location.pathname

  // Don't show header on auth pages
  const showHeader = !location.includes('/login') && !location.includes('/register')

  return (
    <div className="app">
      {showHeader && <Header />}
      <main className="app-main">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/boss" element={
            <ProtectedRoute requiredRole="BOSS">
              <BossDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Temporary: UI preview route (no auth) */}
          <Route path="/admin-upload" element={<AdminDashboard />} />
          
          <Route path="/questions" element={
            <ProtectedRoute requiredRole="STUDENT">
              <Questions />
            </ProtectedRoute>
          } />
          
          {/* Default redirect based on user role */}
          <Route path="/" element={
            isAuthenticated() ? (
              canAccessBoss() ? <Navigate to="/boss" replace /> :
              canAccessAdmin() ? <Navigate to="/admin" replace /> :
              canAccessStudent() ? <Navigate to="/questions" replace /> :
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
