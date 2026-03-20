import { useAuth } from '../contexts/AuthContext'
import '../css/Header.css'

function Header() {
    const { user, logout } = useAuth()

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout()
        }
    }

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="logo">
                    <h1>Reflecta</h1>
                </div>
                
                <div className="user-info">
                    <span className="user-role">{user?.role}</span>
                    <span className="user-name">{user?.name}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
