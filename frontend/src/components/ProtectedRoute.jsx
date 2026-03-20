import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, hasRole, canAccessBoss, canAccessAdmin, canAccessStudent, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'radial-gradient(1200px 600px at 10% 10%, rgba(99, 102, 241, 0.55), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(168, 85, 247, 0.45), transparent 55%), linear-gradient(135deg, #0b1020, #0e1b3a)'
            }}>
                <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
            </div>
        )
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    // Check role-based access
    if (requiredRole === 'BOSS' && !canAccessBoss()) {
        return <Navigate to="/questions" replace />
    }

    if (requiredRole === 'ADMIN' && !canAccessAdmin()) {
        return <Navigate to="/questions" replace />
    }

    if (requiredRole === 'STUDENT' && !canAccessStudent()) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute
