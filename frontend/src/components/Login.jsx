import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/Auth.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://reflecta-backend-ceyc.onrender.com"

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (response.ok) {
                // Store token and user info
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                
                // Force page reload to trigger AuthContext to read new localStorage values
                window.location.href = data.user.role === 'BOSS' ? '/boss' : 
                                     data.user.role === 'ADMIN' ? '/admin' : 
                                     '/questions'
            } else {
                setError(data.error || 'Login failed')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome to Reflecta</h1>
                    <p className="auth-subtitle">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="auth-footer-text">
                        Don't have an account? <a href="/register" className="auth-link">Register as Student</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
