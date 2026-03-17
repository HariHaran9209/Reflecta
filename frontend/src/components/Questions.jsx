import { useEffect, useState } from 'react'

function Questions() {

    const [ questions, setQuestions ] = useState([])
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"

    useEffect(() => {
        fetch(`${API_BASE_URL}/questions/`)
        .then(res => res.json())
        .then(data => setQuestions(data));
    }, [])

    return (
        <div>
        {questions.map((q, i) => (
            <div key={i}>
            <img
                src={`${API_BASE_URL}${q.questionImage}`}
                width="500"
            />

            <div>
                <button>A</button>
                <button>B</button>
                <button>C</button>
                <button>D</button>
            </div>
            </div>
        ))}
        </div>
    )
}

export default Questions;