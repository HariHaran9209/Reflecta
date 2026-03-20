import { useState, useEffect } from 'react'
import '../css/BossDashboard.css'
import BossAdminManagement from './BossAdminManagement'

function BossDashboard() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://reflecta-backend-ceyc.onrender.com"
    
    const [questions, setQuestions] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [activeTab, setActiveTab] = useState('questions') // New state for tabs
    const [filter, setFilter] = useState({
        subjectId: '',
        chapterId: '',
        year: '',
        difficulty: '',
        type: ''
    })

    const subjectOptions = [
        { value: "101", label: "Mathematics" },
        { value: "102", label: "Physics" },
        { value: "103", label: "Chemistry" },
    ]

    const chaptersBySubject = {
        "101": [
            { value: "10101", label: "Relations and Functions" },
            { value: "10102", label: "Inverse Trigonometric Functions" },
            { value: "10103", label: "Matrices" },
            { value: "10104", label: "Determinants" },
            { value: "10105", label: "Continuity and Differentiability" },
            { value: "10106", label: "Application of Derivatives" },
            { value: "10107", label: "Integrals" },
            { value: "10108", label: "Application of Integrals" },
            { value: "10109", label: "Differential Equations" },
            { value: "10110", label: "Vector Algebra" },
            { value: "10111", label: "Three Dimensional Geometry" },
            { value: "10112", label: "Linear Programming" },
            { value: "10113", label: "Probability" }
        ],
        "102": [
            { value: "10201", label: "Electric Charges and Fields" },
            { value: "10202", label: "Electrostatic Potential and Capacitance" },
            { value: "10203", label: "Current Electricity" },
            { value: "10204", label: "Moving Charge and Magnetism" },
            { value: "10205", label: "Magnetism and Matter" },
            { value: "10206", label: "Electromagnetic Induction" },
            { value: "10207", label: "Alternating Current" },
            { value: "10208", label: "Electromagnetic Wave" },
            { value: "10209", label: "Ray Optics and Optical Instruments" },
            { value: "10210", label: "Wave Optics" },
            { value: "10211", label: "Dual Nature of Radiation and Matter" },
            { value: "10212", label: "Atoms" },
            { value: "10213", label: "Nuclei" },
            { value: "10214", label: "Semiconductor and Electronics Devices" }
        ],
        "103": [
            { value: "10301", label: "Solutions" },
            { value: "10302", label: "Electrochemistry" },
            { value: "10303", label: "Chemical Kinetics" },
            { value: "10304", label: "The d- and f-Block Elements" },
            { value: "10305", label: "Coordination Compounds" },
            { value: "10306", label: "Haloalkanes and Haloarenes" },
            { value: "10307", label: "Alcohols, Phenols and Ethers" },
            { value: "10308", label: "Aldehydes, Ketones and Carboxylic Acids" },
            { value: "10309", label: "Amines" },
            { value: "10310", label: "Biomolecules" }
        ]
    }

    useEffect(() => {
        fetchQuestions()
        fetchStats()
    }, [])

    const fetchQuestions = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE_URL}/boss/questions/`)
            if (!response.ok) throw new Error('Failed to fetch questions')
            const data = await response.json()
            setQuestions(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/boss/stats/`)
            if (!response.ok) throw new Error('Failed to fetch stats')
            const data = await response.json()
            setStats(data)
        } catch (err) {
            console.error('Failed to fetch stats:', err)
        }
    }

    const handleEdit = (question) => {
        setEditingQuestion({ ...question })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`${API_BASE_URL}/boss/question/${editingQuestion._id}/update/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingQuestion),
            })
            
            if (!response.ok) throw new Error('Failed to update question')
            
            setEditingQuestion(null)
            fetchQuestions()
            fetchStats()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDelete = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return
        
        try {
            const response = await fetch(`${API_BASE_URL}/boss/question/${questionId}/delete/`, {
                method: 'DELETE',
            })
            
            if (!response.ok) throw new Error('Failed to delete question')
            
            fetchQuestions()
            fetchStats()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilter(prev => ({ ...prev, [key]: value }))
    }

    const filteredQuestions = questions.filter(q => {
        return (!filter.subjectId || q.subjectId === filter.subjectId) &&
               (!filter.chapterId || q.chapterId === filter.chapterId) &&
               (!filter.year || q.year.toString() === filter.year) &&
               (!filter.difficulty || q.difficulty.toString() === filter.difficulty) &&
               (!filter.type || q.type === filter.type)
    })

    const getSubjectLabel = (subjectId) => {
        return subjectOptions.find(s => s.value === subjectId)?.label || subjectId
    }

    const getChapterLabel = (subjectId, chapterId) => {
        return chaptersBySubject[subjectId]?.find(c => c.value === chapterId)?.label || chapterId
    }

    if (loading) return <div className="loading">Loading...</div>
    if (error) return <div className="error">Error: {error}</div>

    return (
        <div className="boss-dashboard">
            <header className="dashboard-header">
                <h1>Boss Dashboard - Reflecta</h1>
                <p>Manage your Reflecta system</p>
            </header>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                >
                    Questions Management
                </button>
                <button 
                    className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admins')}
                >
                    Admin Management
                </button>
            </div>

            {/* Questions Tab */}
            {activeTab === 'questions' && (
                <>
                    {stats && (
                        <section className="stats-section">
                            <h2>Statistics</h2>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3>Total Questions</h3>
                                    <p className="stat-number">{stats.total_questions}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>By Subject</h3>
                                    {stats.by_subject.map(item => (
                                        <div key={item._id} className="stat-item">
                                            {getSubjectLabel(item._id)}: {item.count}
                                        </div>
                                    ))}
                                </div>
                                <div className="stat-card">
                                    <h3>By Year</h3>
                                    {stats.by_year.map(item => (
                                        <div key={item._id} className="stat-item">
                                            {item._id}: {item.count}
                                        </div>
                                    ))}
                                </div>
                                <div className="stat-card">
                                    <h3>By Difficulty</h3>
                                    {stats.by_difficulty.map(item => (
                                        <div key={item._id} className="stat-item">
                                            Level {item._id}: {item.count}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="filters-section">
                        <h2>Filters</h2>
                        <div className="filters-grid">
                            <select value={filter.subjectId} onChange={(e) => handleFilterChange('subjectId', e.target.value)}>
                                <option value="">All Subjects</option>
                                {subjectOptions.map(subject => (
                                    <option key={subject.value} value={subject.value}>{subject.label}</option>
                                ))}
                            </select>
                            
                            <select value={filter.chapterId} onChange={(e) => handleFilterChange('chapterId', e.target.value)} disabled={!filter.subjectId}>
                                <option value="">All Chapters</option>
                                {filter.subjectId && chaptersBySubject[filter.subjectId]?.map(chapter => (
                                    <option key={chapter.value} value={chapter.value}>{chapter.label}</option>
                                ))}
                            </select>
                            
                            <select value={filter.year} onChange={(e) => handleFilterChange('year', e.target.value)}>
                                <option value="">All Years</option>
                                {[2024, 2023, 2022, 2021].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            
                            <select value={filter.difficulty} onChange={(e) => handleFilterChange('difficulty', e.target.value)}>
                                <option value="">All Difficulties</option>
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                            </select>
                            
                            <select value={filter.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
                                <option value="">All Types</option>
                                <option value="MCQ">MCQ</option>
                                <option value="SHORT">Short Answer</option>
                                <option value="LONG">Long Answer</option>
                                <option value="CASE">Case Study</option>
                                <option value="AR">Assertion Reason</option>
                            </select>
                        </div>
                    </section>

                    <section className="questions-section">
                        <h2>Questions ({filteredQuestions.length})</h2>
                        <div className="questions-grid">
                            {filteredQuestions.map(question => (
                                <div key={question._id} className="question-card">
                                    <div className="question-header">
                                        <h3>{getSubjectLabel(question.subjectId)} - {getChapterLabel(question.subjectId, question.chapterId)}</h3>
                                        <span className="question-year">{question.year}</span>
                                    </div>
                                    <div className="question-content">
                                        {question.questionImage && (
                                            <img src={question.questionImage} alt="Question" className="question-image" />
                                        )}
                                    </div>
                                    <div className="question-meta">
                                        <span className="difficulty-badge level-{question.difficulty}">Level {question.difficulty}</span>
                                        <span className="type-badge">{question.type}</span>
                                        <span className="marks-badge">{question.marks} marks</span>
                                    </div>
                                    <div className="question-actions">
                                        <button onClick={() => handleEdit(question)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(question._id)} className="delete-btn">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {editingQuestion && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>Edit Question</h2>
                                <form onSubmit={handleUpdate}>
                                    <div className="form-grid">
                                        <select value={editingQuestion.subjectId} onChange={(e) => setEditingQuestion({...editingQuestion, subjectId: e.target.value})}>
                                            {subjectOptions.map(subject => (
                                                <option key={subject.value} value={subject.value}>{subject.label}</option>
                                            ))}
                                        </select>
                                        
                                        <select value={editingQuestion.chapterId} onChange={(e) => setEditingQuestion({...editingQuestion, chapterId: e.target.value})}>
                                            {chaptersBySubject[editingQuestion.subjectId]?.map(chapter => (
                                                <option key={chapter.value} value={chapter.value}>{chapter.label}</option>
                                            ))}
                                        </select>
                                        
                                        <input type="number" value={editingQuestion.year} onChange={(e) => setEditingQuestion({...editingQuestion, year: e.target.value})} placeholder="Year" />
                                        
                                        <select value={editingQuestion.difficulty} onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value})}>
                                            {[1, 2, 3, 4, 5].map(level => (
                                                <option key={level} value={level}>Level {level}</option>
                                            ))}
                                        </select>
                                        
                                        <select value={editingQuestion.type} onChange={(e) => setEditingQuestion({...editingQuestion, type: e.target.value})}>
                                            <option value="MCQ">MCQ</option>
                                            <option value="SHORT">Short Answer</option>
                                            <option value="LONG">Long Answer</option>
                                            <option value="CASE">Case Study</option>
                                            <option value="AR">Assertion Reason</option>
                                        </select>
                                        
                                        <input type="number" value={editingQuestion.marks} onChange={(e) => setEditingQuestion({...editingQuestion, marks: e.target.value})} placeholder="Marks" />
                                        
                                        {editingQuestion.type === "MCQ" && (
                                            <select value={editingQuestion.correctOption} onChange={(e) => setEditingQuestion({...editingQuestion, correctOption: e.target.value})}>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        )}
                                    </div>
                                    
                                    <div className="modal-actions">
                                        <button type="submit" className="save-btn">Save Changes</button>
                                        <button type="button" onClick={() => setEditingQuestion(null)} className="cancel-btn">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Admin Management Tab */}
            {activeTab === 'admins' && (
                <BossAdminManagement />
            )}
        </div>
    )
}

export default BossDashboard
