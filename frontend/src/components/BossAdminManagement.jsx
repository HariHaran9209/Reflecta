import { useState, useEffect } from 'react'
import '../css/BossAdminManagement.css'

function BossAdminManagement() {
    const [pendingAdmins, setPendingAdmins] = useState([])
    const [approvedAdmins, setApprovedAdmins] = useState([])
    const [adminStats, setAdminStats] = useState({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newAdmin, setNewAdmin] = useState({ email: '', password: '', name: '' })
    const [selectedAdmin, setSelectedAdmin] = useState(null)
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://reflecta-backend-ceyc.onrender.com"
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchPendingAdmins()
        fetchApprovedAdmins()
        fetchAdminStats()
    }, [])

    const fetchPendingAdmins = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/boss/pending-admins/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setPendingAdmins(data.pending_admins)
            } else {
                setError('Failed to fetch pending admins')
            }
        } catch (err) {
            setError('Network error')
        }
    }

    const fetchApprovedAdmins = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/boss/approved-admins/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setApprovedAdmins(data.approved_admins)
            } else {
                // Fallback - we'll implement this endpoint later
                setApprovedAdmins([])
            }
        } catch (err) {
            setApprovedAdmins([])
        }
    }

    const fetchAdminStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/boss/admin-stats/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setAdminStats(data)
            } else {
                // Fallback - we'll implement this endpoint later
                setAdminStats({})
            }
        } catch (err) {
            setAdminStats({})
        }
    }

    const approveAdmin = async (adminId) => {
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/boss/approve-admin/${adminId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setSuccess('Admin approved successfully!')
                fetchPendingAdmins()
                fetchApprovedAdmins()
                fetchAdminStats()
            } else {
                setError('Failed to approve admin')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const createAdmin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch(`${API_BASE_URL}/boss/create-admin/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAdmin)
            })

            if (response.ok) {
                setSuccess('Admin created successfully!')
                setNewAdmin({ email: '', password: '', name: '' })
                setShowCreateForm(false)
                fetchApprovedAdmins()
                fetchAdminStats()
            } else {
                const data = await response.json()
                setError(data.error || 'Failed to create admin')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const getAdminQuestionStats = async (adminId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/boss/admin-questions/${adminId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setSelectedAdmin({...selectedAdmin, questionStats: data})
            }
        } catch (err) {
            console.error('Failed to fetch admin question stats')
        }
    }

    return (
        <div className="admin-management-container">
            <div className="admin-management-header">
                <h2>Admin Management</h2>
                <button 
                    className="create-admin-btn"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Cancel' : 'Create New Admin'}
                </button>
            </div>

            {/* Admin Statistics */}
            <div className="admin-stats-grid">
                <div className="stat-card">
                    <h3>Total Admins</h3>
                    <p className="stat-number">{approvedAdmins.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Approvals</h3>
                    <p className="stat-number">{pendingAdmins.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Questions Uploaded</h3>
                    <p className="stat-number">{adminStats.totalQuestions || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Active This Month</h3>
                    <p className="stat-number">{adminStats.activeThisMonth || 0}</p>
                </div>
            </div>

            {error && <div className="admin-error">{error}</div>}
            {success && <div className="admin-success">{success}</div>}

            {showCreateForm && (
                <div className="create-admin-form">
                    <h3>Create New Admin</h3>
                    <form onSubmit={createAdmin}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={newAdmin.email}
                                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={newAdmin.password}
                                onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                                required
                                minLength="6"
                            />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Admin'}
                        </button>
                    </form>
                </div>
            )}

            <div className="admins-sections">
                {/* Pending Admins */}
                <div className="pending-admins-section">
                    <h3>Pending Admin Approvals ({pendingAdmins.length})</h3>
                    
                    {pendingAdmins.length === 0 ? (
                        <div className="no-pending">
                            <p>No pending admin approvals</p>
                        </div>
                    ) : (
                        <div className="admins-list">
                            {pendingAdmins.map((admin) => (
                                <div key={admin._id} className="admin-card pending">
                                    <div className="admin-info">
                                        <h4>{admin.name || 'No Name'}</h4>
                                        <p>{admin.email}</p>
                                        <span className="admin-date">
                                            Applied: {new Date(admin.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="admin-status pending">Pending Approval</span>
                                    </div>
                                    <div className="admin-actions">
                                        <button 
                                            className="approve-btn"
                                            onClick={() => approveAdmin(admin._id)}
                                            disabled={loading}
                                        >
                                            {loading ? 'Approving...' : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Approved Admins */}
                <div className="approved-admins-section">
                    <h3>Approved Admins ({approvedAdmins.length})</h3>
                    
                    {approvedAdmins.length === 0 ? (
                        <div className="no-approved">
                            <p>No approved admins yet</p>
                        </div>
                    ) : (
                        <div className="admins-list">
                            {approvedAdmins.map((admin) => (
                                <div key={admin._id} className="admin-card approved">
                                    <div className="admin-info">
                                        <h4>{admin.name || 'No Name'}</h4>
                                        <p>{admin.email}</p>
                                        <span className="admin-date">
                                            Joined: {new Date(admin.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="admin-status approved">Active</span>
                                        {admin.questionStats && (
                                            <div className="admin-question-stats">
                                                <span>Questions: {admin.questionStats.total}</span>
                                                <span>This Month: {admin.questionStats.thisMonth}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="admin-actions">
                                        <button 
                                            className="stats-btn"
                                            onClick={() => {
                                                setSelectedAdmin(admin)
                                                if (!admin.questionStats) {
                                                    getAdminQuestionStats(admin._id)
                                                }
                                            }}
                                        >
                                            View Stats
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Details Modal */}
            {selectedAdmin && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Admin Details</h3>
                        <div className="admin-details">
                            <div className="detail-row">
                                <label>Name:</label>
                                <span>{selectedAdmin.name}</span>
                            </div>
                            <div className="detail-row">
                                <label>Email:</label>
                                <span>{selectedAdmin.email}</span>
                            </div>
                            <div className="detail-row">
                                <label>Role:</label>
                                <span>{selectedAdmin.role}</span>
                            </div>
                            <div className="detail-row">
                                <label>Status:</label>
                                <span className="admin-status approved">Active</span>
                            </div>
                            <div className="detail-row">
                                <label>Joined:</label>
                                <span>{new Date(selectedAdmin.created_at).toLocaleDateString()}</span>
                            </div>
                            {selectedAdmin.questionStats && (
                                <div className="question-stats-details">
                                    <h4>Question Statistics</h4>
                                    <div className="detail-row">
                                        <label>Total Questions:</label>
                                        <span>{selectedAdmin.questionStats.total}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>This Month:</label>
                                        <span>{selectedAdmin.questionStats.thisMonth}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Last Upload:</label>
                                        <span>{selectedAdmin.questionStats.lastUpload ? 
                                            new Date(selectedAdmin.questionStats.lastUpload).toLocaleDateString() : 
                                            'No uploads yet'
                                        }</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setSelectedAdmin(null)} className="close-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BossAdminManagement
