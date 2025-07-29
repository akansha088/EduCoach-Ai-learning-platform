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
  // User quiz attempt state
  const [userAnswers, setUserAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [fullScreenQuiz, setFullScreenQuiz] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [lastScore, setLastScore] = useState(null);

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

  // Fetch previous attempt for selected quiz
  const fetchUserAttempt = async (quizId) => {
    setAttemptLoading(true);
    setAttemptId(null);
    setUserAnswers({});
    setShowScore(false);
    setLastScore(null);
    try {
      const { data } = await axios.get(`${server}/api/user/quiz/attempt?quizId=${quizId}`, authConfig);
      if (data.attempt) {
        setAttemptId(data.attempt._id);
        // Map responses to { [questionId]: selected }
        const answers = {};
        data.attempt.responses.forEach(r => { answers[r.questionId] = r.selected; });
        setUserAnswers(answers);
        setLastScore(data.attempt.score);
        setShowScore(true);
      }
    } catch (err) {
      // No previous attempt, ignore
    }
    setAttemptLoading(false);
  };

  const handleUserAnswer = (questionId, value) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleUserSubmit = async (quiz) => {
    const responses = quiz.questions.map(q => ({
      questionId: q._id || q.question, // fallback to question text if no _id
      selected: userAnswers[q._id || q.question] || ""
    }));
    // Calculate score (simple: correct answer match)
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if ((userAnswers[q._id || q.question] || "").trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase()) {
        score++;
      }
    });
    const payload = {
      quizId: quiz._id,
      responses,
      score,
      total: quiz.questions.length
    };
    try {
      if (attemptId) {
        const { data } = await axios.put(`${server}/api/user/quiz/attempt/${attemptId}`, payload, authConfig);
        toast.success(data.message || "Quiz updated!");
        setLastScore(score);
        setShowScore(true);
      } else {
        const { data } = await axios.post(`${server}/api/user/quiz/attempt`, payload, authConfig);
        toast.success(data.message || "Quiz submitted!");
        setAttemptId(data.attempt._id);
        setLastScore(score);
        setShowScore(true);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  // When a quiz is selected, fetch previous attempt
  useEffect(() => {
    if (selectedQuizIndex !== null && quizzes[selectedQuizIndex]) {
      fetchUserAttempt(quizzes[selectedQuizIndex]._id);
    }
  }, [selectedQuizIndex]);

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
    onClick={() => {
      setSelectedQuizIndex(index);
      setFullScreenQuiz(true);
    }}
  >
    Start Quiz
  </button>
</div>

            ))}
          </div>
        </>
      ) : quizzes.length > 0 ? (
        selectedQuizIndex !== null && !fullScreenQuiz ? (
          <>
            <button onClick={() => setSelectedQuizIndex(null)} className="common-btn">⬅ Back to Quizzes</button>
            <h2>{quizzes[selectedQuizIndex].title}</h2>
            {attemptLoading ? <p>Loading your previous attempt...</p> : null}
            {quizzes[selectedQuizIndex].questions.map((q, idx) => (
              <div key={q._id || idx} className="quiz-question">
                <p>{idx + 1}. {q.question}</p>
                {(q.type === "mcq" || q.type === "truefalse") ? (
                  q.options.map((option, i) => (
                    <label key={i} className="option-label">
                      <input
                        type="radio"
                        name={`q-${q._id || idx}`}
                        value={option}
                        checked={userAnswers[q._id || q.question] === option}
                        onChange={() => handleUserAnswer(q._id || q.question, option)}
                      /> {option}
                    </label>
                  ))
                ) : (
                  <textarea
                    rows="2"
                    placeholder="Your Answer..."
                    value={userAnswers[q._id || q.question] || ""}
                    onChange={e => handleUserAnswer(q._id || q.question, e.target.value)}
                  />
                )}
              </div>
            ))}
            <button
              className="common-btn"
              onClick={() => handleUserSubmit(quizzes[selectedQuizIndex])}
              disabled={attemptLoading}
            >
              {attemptId ? "Update Quiz" : "Submit Quiz"}
            </button>
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
    onClick={() => {
      setSelectedQuizIndex(index);
      setFullScreenQuiz(true);
    }}
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
      {selectedQuizIndex !== null && fullScreenQuiz && (
        <div className="quiz-fullscreen-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
        }}>
          <button
            style={{ position: 'absolute', top: 20, right: 30, zIndex: 10000, fontSize: 24, background: 'red', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => {
              setFullScreenQuiz(false);
              setSelectedQuizIndex(null);
            }}
          >
            Close Quiz ✖
          </button>
          <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', background: 'white', borderRadius: 12, padding: 24 }}>
            <h2>{quizzes[selectedQuizIndex].title}</h2>
            {attemptLoading ? <p>Loading your previous attempt...</p> : null}
            {quizzes[selectedQuizIndex].questions.map((q, idx) => (
              <div key={q._id || idx} className="quiz-question">
                <p>{idx + 1}. {q.question}</p>
                {(q.type === "mcq" || q.type === "truefalse") ? (
                  q.options.map((option, i) => (
                    <label key={i} className="option-label">
                      <input
                        type="radio"
                        name={`q-${q._id || idx}`}
                        value={option}
                        checked={userAnswers[q._id || q.question] === option}
                        onChange={() => handleUserAnswer(q._id || q.question, option)}
                      /> {option}
                    </label>
                  ))
                ) : (
                  <textarea
                    rows="2"
                    placeholder="Your Answer..."
                    value={userAnswers[q._id || q.question] || ""}
                    onChange={e => handleUserAnswer(q._id || q.question, e.target.value)}
                  />
                )}
              </div>
            ))}
            <button
              className="common-btn"
              onClick={() => handleUserSubmit(quizzes[selectedQuizIndex])}
              disabled={attemptLoading}
            >
              {attemptId ? "Update Quiz" : "Submit Quiz"}
            </button>
            {showScore && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <h3>Score: {lastScore} / {quizzes[selectedQuizIndex].questions.length}</h3>
                <div style={{ color: 'green', fontWeight: 'bold', margin: '8px 0' }}>Test Attempted</div>
                <button
                  className="common-btn"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setUserAnswers({});
                    setShowScore(false);
                    setLastScore(null);
                    setAttemptId(null);
                  }}
                >
                  Re-attempt Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTab;
