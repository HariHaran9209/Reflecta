import { useEffect, useState } from 'react'
import '../css/Questions.css'

function Questions() {

    const [ questions, setQuestions ] = useState([])
    const [ error, setError ] = useState("")
    const [ currentQuestionIndex, setCurrentQuestionIndex ] = useState(0)
    const [ selectedOption, setSelectedOption ] = useState(null)
    const [ showExplanation, setShowExplanation ] = useState(false)
    const [ isCorrect, setIsCorrect ] = useState(null)
    const [ wrongAttempts, setWrongAttempts ] = useState([])
    const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const API_BASE_URL = rawApiBaseUrl || "http://127.0.0.1:8000"
    const apiBaseMisconfigured =
        !!rawApiBaseUrl &&
        rawApiBaseUrl.includes("127.0.0.1") &&
        typeof window !== "undefined" &&
        window.location.hostname.includes("onrender.com")

    useEffect(() => {
        setError("")
        if (apiBaseMisconfigured) {
            setError("Frontend API is pointing to 127.0.0.1. Update VITE_API_BASE_URL to your backend Render URL.")
            return
        }
        fetch(`${API_BASE_URL}/questions/`)
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`)
                return res.json()
            })
            .then((data) => setQuestions(data))
            .catch((e) => {
                setError(e?.message || "Failed to load questions")
            })
    }, [])

    const handleOptionClick = (option) => {
        if (selectedOption && !showExplanation) return // Don't allow clicks while showing "try again"
        
        const currentQuestion = questions[currentQuestionIndex]
        
        // Debug: log all fields in the question data
        console.log("Question data:", currentQuestion)
        console.log("All question fields:", Object.keys(currentQuestion))
        console.log("Selected option:", option)
        console.log("Correct option field:", currentQuestion.correctOption)
        console.log("Explanation field:", currentQuestion.explanation)
        console.log("Explanation image field:", currentQuestion.explanationImage)
        
        // Check if explanation contains the correct answer
        if (currentQuestion.explanation && typeof currentQuestion.explanation === 'string') {
            console.log("Explanation text:", currentQuestion.explanation)
        }
        
        // Use the actual correct option from backend
        const correct = option === currentQuestion.correctOption
        
        console.log("Is correct?", correct)
        
        setSelectedOption(option)
        setIsCorrect(correct)
        
        if (correct) {
            setShowExplanation(true)
        } else {
            setWrongAttempts([...wrongAttempts, option])
            // Show "try again" message for 2 seconds, then reset for another attempt
            setTimeout(() => {
                setSelectedOption(null)
                setIsCorrect(null)
            }, 2000)
        }
    }

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setSelectedOption(null)
            setShowExplanation(false)
            setIsCorrect(null)
            setWrongAttempts([])
        }
    }

    const getExplanationSrc = (explanationImage) => {
        if (!explanationImage) return null
        return explanationImage.startsWith("/")
            ? `${API_BASE_URL}${explanationImage}`
            : explanationImage
    }

    const currentQuestion = questions[currentQuestionIndex]

    return (
        <div className="student-questions-page">
            {error && <div className="student-error">Error: {error}</div>}
            {!error && questions.length === 0 && <div className="student-loading">Loading questions...</div>}
            
            {!error && questions.length > 0 && currentQuestion && (
                <div className="student-questions-list">
                    <div className="student-question-card">
                        {/* Question counter */}
                        <div className="student-question-counter">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </div>
                        
                        {/* Question image */}
                        {(() => {
                            const questionSrc = currentQuestion.questionImage?.startsWith("/")
                                ? `${API_BASE_URL}${currentQuestion.questionImage}`
                                : currentQuestion.questionImage
                            
                            return questionSrc && (
                                <img
                                    className="student-question-image"
                                    src={questionSrc}
                                    alt="Question"
                                />
                            )
                        })()}

                        {/* Options */}
                        <div className="student-options">
                            {["A", "B", "C", "D"].map((opt) => {
                                const isDisabled = wrongAttempts.includes(opt) || (selectedOption && !showExplanation)
                                const isSelected = selectedOption === opt
                                let buttonClass = "student-option-btn"
                                
                                if (isSelected) {
                                    buttonClass += isCorrect ? " student-option-btn--correct" : " student-option-btn--wrong"
                                } else if (isDisabled) {
                                    buttonClass += " student-option-btn--disabled"
                                }
                                
                                return (
                                    <button 
                                        key={opt} 
                                        className={buttonClass}
                                        type="button"
                                        onClick={() => handleOptionClick(opt)}
                                        disabled={isDisabled}
                                    >
                                        {opt}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Feedback message */}
                        {selectedOption && !showExplanation && (
                            <div className={`student-feedback ${isCorrect ? 'student-feedback--correct' : 'student-feedback--wrong'}`}>
                                {isCorrect ? 'Correct! 🎉' : 'Give it another try! 🤔'}
                            </div>
                        )}

                        {/* Explanation section */}
                        {showExplanation && (
                            <div className="student-explanation">
                                <div className="student-explanation-title">Explanation:</div>
                                {(() => {
                                    // Handle both old and new field names
                                    const explanationSrc = getExplanationSrc(currentQuestion.explanationImage) || 
                                                         getExplanationSrc(currentQuestion.explanation)
                                    return explanationSrc && explanationSrc !== "NA" ? (
                                        <img
                                            className="student-explanation-image"
                                            src={explanationSrc}
                                            alt="Explanation"
                                        />
                                    ) : (
                                        <div className="student-explanation-unavailable">
                                            Explanation not available
                                        </div>
                                    )
                                })()}
                                
                                {/* Next button */}
                                {currentQuestionIndex < questions.length - 1 && (
                                    <button 
                                        className="student-next-btn"
                                        onClick={handleNextQuestion}
                                    >
                                        Next Question →
                                    </button>
                                )}
                                
                                {/* Quiz completion message */}
                                {currentQuestionIndex === questions.length - 1 && (
                                    <div className="student-quiz-complete">
                                        🎊 Quiz Complete! Great job!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Questions;