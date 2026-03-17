import { useState, useEffect } from 'react'
import '../css/AdminDashboard.css'

function AdminDashboard() {

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
    
    const [ subjectId, setSubjectId ] = useState("")
    const [ subjectLocked, setSubjectLocked ] = useState(false)
    const [ chapterId, setChapterId ] = useState("")
    const [ year, setYear ] = useState("")
    const [ difficulty, setDiffulty ] = useState(1)
    const [ marks, setMarks ] = useState(1)
    const [ questionType, setQuestionType ] = useState("MCQ")
    const [ shortAnswerMarks, setShortAnswerMarks ] = useState(2)
    const [ correctOption, setCorrectOption ] = useState("A")
    
    const [ questionImage, setQuestionImage ] = useState(null)
    const [ explanationImage, setExplanationImage ] = useState(null)

    useEffect(() => {
        if (questionType === "MCQ") {
            setMarks(1)
        } else if (questionType === "SHORT") {
            setMarks(shortAnswerMarks)
        } else if (questionType === "CASE") {
            setMarks(4)
        } else if (questionType === "LONG") {
            setMarks(5)
        } else if (questionType === "AR") {
            setMarks(1)
        }
    }, [questionType, shortAnswerMarks])

    const subjectOptions = [
        { value: "101", label: "Mathematics" },
        { value: "102", label: "Physics" },
        { value: "103", label: "Chemistry" },
    ]

    const chaptersBySubject = {
        "101": [
            { value: "10101", label: "Integrals" },
            { value: "10102", label: "Differentiation" },
            { value: "10103", label: "Matrices" },
            { value: "10104", label: "Probability" },
        ],
        "102": [
            { value: "10201", label: "Kinematics" },
            { value: "10202", label: "Laws of Motion" },
            { value: "10203", label: "Work, Energy & Power" },
            { value: "10204", label: "Electrostatics" },
        ],
        "103": [
            { value: "10301", label: "Atomic Structure" },
            { value: "10302", label: "Chemical Bonding" },
            { value: "10303", label: "Thermodynamics" },
            { value: "10304", label: "Organic Basics" },
        ],
    }

    const chapterOptions = subjectId ? (chaptersBySubject[subjectId] ?? []) : []

    useEffect(() => {
        // Reset chapter whenever subject changes
        setChapterId("")
    }, [subjectId])

    useEffect(() => {
        const savedSubjectId = localStorage.getItem("admin_subjectId")
        const savedLocked = localStorage.getItem("admin_subjectLocked")
        if (savedSubjectId) setSubjectId(savedSubjectId)
        if (savedLocked === "true") setSubjectLocked(true)
    }, [])

    useEffect(() => {
        if (subjectId) localStorage.setItem("admin_subjectId", subjectId)
    }, [subjectId])

    useEffect(() => {
        localStorage.setItem("admin_subjectLocked", String(subjectLocked))
    }, [subjectLocked])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const formData = new FormData();

        formData.append("subjectId", subjectId)
        formData.append("chapterId", chapterId)
        formData.append("year", year)
        formData.append("difficulty", difficulty)
        formData.append("type", questionType)
        formData.append("marks", marks)
        formData.append("correctOption", questionType === "MCQ" ? correctOption : "")

        formData.append("questionImage", questionImage)
        formData.append("explanationImage", explanationImage)

        const res = await fetch(`${API_BASE_URL}/upload_question/`, {
            method: 'POST',
            body: formData
        })
        if (!res.ok) {
            alert("Upload failed")
            return
        }
        setSubjectLocked(true)
        setChapterId("")
        alert("Question Uploaded")
    }

    return (
        <div className="admin-container">
            <form onSubmit={handleSubmit} className="admin-card">
                <div className="admin-card-header">
                    <div>
                        <h2 className="admin-title">Upload Question</h2>
                        <p className="admin-subtitle">Add a new question with images and metadata.</p>
                    </div>
                    <div className="admin-badge">Admin</div>
                </div>

                <div className="admin-grid">
                    <div className="admin-field">
                        <label className="admin-label" htmlFor="subjectId">Subject</label>
                        <select
                            id="subjectId"
                            className="admin-input"
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            disabled={subjectLocked}
                        >
                            <option value="" disabled>Select subject</option>
                            {subjectOptions.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        {subjectLocked && (
                            <button
                                type="button"
                                className="admin-link"
                                onClick={() => {
                                    setSubjectLocked(false)
                                    setSubjectId("")
                                    setChapterId("")
                                }}
                            >
                                Change subject
                            </button>
                        )}
                    </div>

                    <div className="admin-field">
                        <label className="admin-label" htmlFor="chapterId">Chapter</label>
                        <select
                            id="chapterId"
                            className="admin-input"
                            value={chapterId}
                            onChange={(e) => setChapterId(e.target.value)}
                            disabled={!subjectId}
                        >
                            <option value="" disabled>
                                {subjectId ? "Select chapter" : "Select subject first"}
                            </option>
                            {chapterOptions.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-field">
                        <label className="admin-label" htmlFor="year">Year</label>
                        <input
                            id="year"
                            className="admin-input"
                            placeholder="e.g. 2024"
                            onChange={(e) => setYear(e.target.value)}
                        />
                    </div>

                    <div className="admin-field">
                        <label className="admin-label" htmlFor="questionType">Type</label>
                        <select
                            id="questionType"
                            className="admin-input"
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                        >
                            <option value="MCQ">MCQ</option>
                            <option value="SHORT">Short answer</option>
                            <option value="CASE">Case-study</option>
                            <option value="LONG">Long answer</option>
                            <option value="AR">Assertion and reason</option>
                        </select>
                    </div>

                    {questionType === "SHORT" && (
                        <div className="admin-field">
                            <label className="admin-label" htmlFor="shortMarks">Short answer marks</label>
                            <select
                                id="shortMarks"
                                className="admin-input"
                                value={shortAnswerMarks}
                                onChange={(e) => setShortAnswerMarks(parseInt(e.target.value, 10))}
                            >
                                <option value={2}>2 marks</option>
                                <option value={3}>3 marks</option>
                            </select>
                        </div>
                    )}

                    <div className="admin-field">
                        <label className="admin-label" htmlFor="difficulty">Difficulty</label>
                        <select id="difficulty" className="admin-input" onChange={(e) => setDiffulty(e.target.value)}>
                            <option value="1">Easy</option>
                            <option value="2">Medium</option>
                            <option value="3">Hard</option>
                        </select>
                    </div>

                    {questionType === "MCQ" && (
                        <div className="admin-field">
                            <label className="admin-label" htmlFor="correctOption">Correct option</label>
                            <select
                                id="correctOption"
                                className="admin-input"
                                value={correctOption}
                                onChange={(e) => setCorrectOption(e.target.value)}
                            >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                    )}

                    <div className="admin-field admin-field--hint">
                        <div className="admin-hint">
                            <div className="admin-hint-title">Tip</div>
                            <div className="admin-hint-body">
                                Upload clear images. PNG/JPG works best.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-divider" />

                <div className="admin-files">
                    <div className="admin-field">
                        <label className="admin-label" htmlFor="questionImage">Question image</label>
                        <input
                            id="questionImage"
                            className="admin-input admin-input--file"
                            type="file"
                            onChange={(e) => setQuestionImage(e.target.files[0])}
                        />
                    </div>

                    <div className="admin-field">
                        <label className="admin-label" htmlFor="explanationImage">Explanation image</label>
                        <input
                            id="explanationImage"
                            className="admin-input admin-input--file"
                            type="file"
                            onChange={(e) => setExplanationImage(e.target.files[0])}
                        />
                    </div>
                </div>

                <div className="admin-actions">
                    <button className="admin-button" type="submit">Upload Question</button>
                    <div className="admin-meta">
                        Marks: <span className="admin-meta-strong">{marks}</span>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AdminDashboard