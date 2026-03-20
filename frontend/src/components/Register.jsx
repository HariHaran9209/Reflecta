import { useState } from 'react'
import '../css/Auth.css'

function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState('STUDENT')
    const [secretKey, setSecretKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://reflecta-backend-ceyc.onrender.com"

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            const requestData = {
                email,
                password,
                name,
                role
            }

            // Add secret key if registering as BOSS
            if (role === 'BOSS') {
                requestData.secret_key = secretKey
            }

            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(`${role} registered successfully! Redirecting to login...`)
                setTimeout(() => {
                    window.location.href = '/login'
                }, 2000)
            } else {
                setError(data.error || 'Registration failed')
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
                    <h1 className="auth-title">Join Reflecta</h1>
                    <p className="auth-subtitle">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="auth-success">
                            {success}
                        </div>
                    )}

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="role">Account Type</label>
                        <select
                            id="role"
                            className="auth-input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="ADMIN">Admin (requires approval)</option>
                            <option value="BOSS">Boss (secret key required)</option>
                        </select>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            className="auth-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

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
                            placeholder="Create a password"
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="auth-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                            minLength="6"
                        />
                    </div>

                    {role === 'BOSS' && (
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="secretKey">BOSS Secret Key</label>
                            <input
                                id="secretKey"
                                type="password"
                                className="auth-input"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                placeholder="Enter BOSS secret key"
                                required
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : `Create ${role} Account`}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="auth-footer-text">
                        Already have an account? <a href="/login" className="auth-link">Sign In</a>
                    </p>
                    <div className="auth-note">
                        <p><strong>Student:</strong> View and organize questions</p>
                        <p><strong>Admin:</strong> Upload questions (requires BOSS approval)</p>
                        <p><strong>Boss:</strong> Full system access (secret key required)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
