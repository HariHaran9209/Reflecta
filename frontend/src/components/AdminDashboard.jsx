import { useState, useEffect } from 'react'
import '../css/AdminDashboard.css'

function AdminDashboard() {

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://reflecta-backend-ceyc.onrender.com"
    
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
        ],
    }

    const chapterOptions = subjectId ? (chaptersBySubject[subjectId] ?? []) : []

    useEffect(() => {
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

        const formData = new FormData()
        formData.append("subjectId", subjectId)
        formData.append("chapterId", chapterId)
        formData.append("year", year)
        formData.append("difficulty", difficulty)
        formData.append("type", questionType)
        formData.append("marks", marks)
        formData.append("correctOption", (questionType === "MCQ" || questionType === "AR") ? correctOption : "")
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

                {/* ── LEFT SIDEBAR ── */}
                <div className="admin-card-header">
                    <div className="admin-sidebar-top">
                        <div className="admin-badge">Admin</div>
                        <div>
                            <h2 className="admin-title">Upload<br />Question</h2>
                            <p className="admin-subtitle">Add a new question with images and metadata.</p>
                        </div>
                        <div className="admin-hint">
                            <div className="admin-hint-title">Tip</div>
                            <div className="admin-hint-body">
                                Upload clear images. PNG/JPG works best. Make sure the question is legible before submitting.
                            </div>
                        </div>
                    </div>

                    <div className="admin-sidebar-bottom">
                        <div className="admin-marks-label">Marks assigned</div>
                        <div className="admin-marks-display">
                            <span className="admin-marks-value">{marks}</span>
                            <span className="admin-marks-unit">mark{marks !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT FORM PANEL ── */}
                <div className="admin-form-body">
                    <div className="admin-grid">

                        {/* Subject */}
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

                        {/* Chapter */}
                        <div className="admin-field admin-field--wide">
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

                        {/* Year */}
                        <div className="admin-field">
                            <label className="admin-label" htmlFor="year">Year</label>
                            <input
                                id="year"
                                className="admin-input"
                                placeholder="e.g. 2024"
                                onChange={(e) => setYear(e.target.value)}
                            />
                        </div>

                        {/* Type */}
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

                        {/* Difficulty */}
                        <div className="admin-field">
                            <label className="admin-label" htmlFor="difficulty">Difficulty</label>
                            <select id="difficulty" className="admin-input" onChange={(e) => setDiffulty(e.target.value)}>
                                <option value="1">Easy</option>
                                <option value="2">Medium</option>
                                <option value="3">Hard</option>
                            </select>
                        </div>

                        {/* Correct option / Short marks */}
                        <div className="admin-field admin-field--wide">
                            {(questionType === "MCQ" || questionType === "AR") && (
                                <>
                                    <label className="admin-label" htmlFor={questionType === "AR" ? "correctOptionAR" : "correctOption"}>
                                        Correct option
                                    </label>
                                    <select
                                        id={questionType === "AR" ? "correctOptionAR" : "correctOption"}
                                        className="admin-input"
                                        value={correctOption}
                                        onChange={(e) => setCorrectOption(e.target.value)}
                                    >
                                        {questionType === "MCQ" ? (
                                            <>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="A">Both A and R are correct and R is the correct explanation of A</option>
                                                <option value="B">Both A and R are correct but R is not the correct explanation of A</option>
                                                <option value="C">A is correct but R is incorrect</option>
                                                <option value="D">A is incorrect but R is correct</option>
                                            </>
                                        )}
                                    </select>
                                </>
                            )}

                            {questionType === "SHORT" && (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>

                    <div className="admin-divider" />

                    {/* File uploads */}
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
                </div>

                {/* ── FOOTER / SUBMIT ── */}
                <div className="admin-form-footer">
                    <button className="admin-button" type="submit">
                        Upload Question
                    </button>
                    <div className="admin-footer-marks">
                        Marks: <strong>{marks}</strong>
                    </div>
                </div>

            </form>
        </div>
    )
}

export default AdminDashboard
