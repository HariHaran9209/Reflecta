import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in on app start
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser)
                setUser(parsedUser)
                setToken(storedToken)
            } catch (error) {
                console.error('Error parsing stored user:', error)
                logout()
            }
        }
        
        setLoading(false)
    }, [])

    const login = (userData, userToken) => {
        setUser(userData)
        setToken(userToken)
        localStorage.setItem('token', userToken)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    const isAuthenticated = () => {
        return !!token && !!user
    }

    const hasRole = (role) => {
        return user && user.role === role
    }

    const canAccessBoss = () => {
        return hasRole('BOSS')
    }

    const canAccessAdmin = () => {
        return hasRole('ADMIN') && (user.approved === true || user.approved === undefined)
    }

    const canAccessStudent = () => {
        return hasRole('STUDENT')
    }

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
        hasRole,
        canAccessBoss,
        canAccessAdmin,
        canAccessStudent,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
