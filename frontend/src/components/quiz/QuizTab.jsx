import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../main";
import "./QuizTab.css";
import toast from "react-hot-toast";

const QuizTab = ({ courseId, authConfig, user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState(null);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "" },
  ]);

  const fetchQuiz = async () => {
    try {
      const { data } = await axios.get(`${server}/api/user/quiz/${courseId}`, authConfig);
      setQuizzes(data.quiz);
    } catch (error) {
      setQuizzes([]);
    }
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handleTypeChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].type = value;
    if (value === "truefalse") {
      newQuestions[index].options = ["True", "False"];
    } else if (value === "short") {
      newQuestions[index].options = [];
    } else {
      newQuestions[index].options = ["", "", "", ""];
    }
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "" }]);
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        questions,
      };
      const { data } = await axios.post(`${server}/api/admin/quiz/${courseId}`, payload, authConfig);
      toast.success(data.message);
      setTitle("");
      setQuestions([{ question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "" }]);
      fetchQuiz();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Quiz upload failed");
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  return (
    <div className="quiz-tab">
      {user?.role === "admin" ? (
        <>
          <h3>Upload Quiz</h3>
          <form onSubmit={submitQuiz} className="quiz-form">
            <input
              type="text"
              placeholder="Quiz Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="question-block">
                <select value={q.type} onChange={(e) => handleTypeChange(qIdx, e.target.value)}>
                  <option value="mcq">MCQ</option>
                  <option value="truefalse">True/False</option>
                  <option value="short">Short Answer</option>
                </select>
                <input
                  type="text"
                  placeholder={`Question ${qIdx + 1}`}
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
                  required
                />
                {q.type === "mcq" &&
                  q.options.map((opt, oIdx) => (
                    <input
                      key={oIdx}
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                      required
                    />
                  ))}
                <input
                  type="text"
                  placeholder="Correct Answer"
                  value={q.correctAnswer}
                  onChange={(e) => handleAnswerChange(qIdx, e.target.value)}
                  required
                />
              </div>
            ))}
            <button type="button" onClick={addQuestion}>+ Add Question</button>
            <button type="submit" className="common-btn">Submit Quiz</button>
          </form>

          <h3>Previously Uploaded Quizzes</h3>
          <div className="quiz-list">
            {quizzes.map((quiz, index) => (
              
              <div key={quiz._id} className="quiz-card">
  <h4>{quiz.title}</h4>
  <p>{quiz.questions.length} questions</p>
  <p>{new Date(quiz.createdAt).toLocaleDateString()}</p>
  <button
    className="common-btn start-btn"
    onClick={() => setSelectedQuizIndex(index)}
  >
    Start Quiz
  </button>
</div>

            ))}
          </div>
        </>
      ) : quizzes.length > 0 ? (
        selectedQuizIndex !== null ? (
          <>
            <button onClick={() => setSelectedQuizIndex(null)} className="common-btn">⬅ Back to Quizzes</button>
            <h2>{quizzes[selectedQuizIndex].title}</h2>
            {quizzes[selectedQuizIndex].questions.map((q, idx) => (
              <div key={idx} className="quiz-question">
                <p>{idx + 1}. {q.question}</p>
                {q.type === "mcq" || q.type === "truefalse" ? (
                  q.options.map((option, i) => (
                    <label key={i} className="option-label">
                      <input type="radio" name={`q-${idx}`} /> {option}
                    </label>
                  ))
                ) : (
                  <textarea rows="2" placeholder="Your Answer..." />
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="quiz-list">
            {quizzes.map((quiz, index) => (
              
             <div key={quiz._id} className="quiz-card">
  <h4>{quiz.title}</h4>
  <p>{quiz.questions.length} questions</p>
  <p>{new Date(quiz.createdAt).toLocaleDateString()}</p>
  <button
    className="common-btn start-btn"
    onClick={() => setSelectedQuizIndex(index)}
  >
    Start Quiz
  </button>
</div>

            ))}
          </div>
        )
      ) : (
        <p>No quiz available for this course.</p>
      )}
    </div>
  );
};

export default QuizTab;
