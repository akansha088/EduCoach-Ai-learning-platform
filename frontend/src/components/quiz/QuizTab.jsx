import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../main";
import "./QuizTab.css";
import toast from "react-hot-toast";

const QuizTab = ({ courseId, authConfig, user, quizState, setQuizState }) => {
  const [quizzes, setQuizzes] = useState([]);
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

  // Fetch previous attempt for selected quiz
  const fetchUserAttempt = async (quizId) => {
    setQuizState(prev => ({ ...prev, attemptLoading: true }));
    
    console.log("🔍 Frontend: Fetching attempt for quizId:", quizId);
    
    try {
      const { data } = await axios.get(`${server}/api/user/quiz/attempt?quizId=${quizId}`, authConfig);
      console.log("✅ Frontend: Quiz attempt response:", data);
      if (data.attempt) {
        setQuizState(prev => ({
          ...prev,
          attemptId: data.attempt._id,
          userAnswers: data.attempt.responses.reduce((acc, r) => ({ ...acc, [r.questionId]: r.selected }), {}),
          lastScore: data.attempt.score,
          showScore: true,
          attemptLoading: false
        }));
      } else {
        setQuizState(prev => ({ ...prev, attemptLoading: false }));
      }
    } catch (err) {
      console.log("❌ Frontend: Error fetching quiz attempt:", err);
      setQuizState(prev => ({ ...prev, attemptLoading: false }));
    }
  };

  const handleUserAnswer = (questionId, value) => {
    setQuizState(prev => ({
      ...prev,
      userAnswers: { ...prev.userAnswers, [questionId]: value }
    }));
  };

  const handleUserSubmit = async (quiz) => {
    const responses = quiz.questions.map(q => ({
      questionId: q._id || q.question,
      selected: quizState.userAnswers[q._id || q.question] || ""
    }));
    
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if ((quizState.userAnswers[q._id || q.question] || "").trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase()) {
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
      if (quizState.attemptId) {
        const { data } = await axios.put(`${server}/api/user/quiz/attempt/${quizState.attemptId}`, payload, authConfig);
        toast.success(data.message || "Quiz updated!");
        setQuizState(prev => ({
          ...prev,
          lastScore: score,
          showScore: true
        }));
      } else {
        const { data } = await axios.post(`${server}/api/user/quiz/attempt`, payload, authConfig);
        toast.success(data.message || "Quiz submitted!");
        setQuizState(prev => ({
          ...prev,
          attemptId: data.attempt._id,
          lastScore: score,
          showScore: true
        }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    }
  };

  const testQuizSystem = async () => {
    try {
      console.log("🧪 Testing quiz system...");
      const { data } = await axios.get(`${server}/api/user/quiz/test`, authConfig);
      console.log("✅ Quiz system test result:", data);
      toast.success("Quiz system test completed");
    } catch (error) {
      console.error("❌ Quiz system test failed:", error);
      toast.error("Quiz system test failed");
    }
  };

  const startQuiz = (index) => {
    setQuizState(prev => ({
      ...prev,
      selectedQuizIndex: index,
      showQuizModal: true,
      userAnswers: {},
      attemptId: null,
      showScore: false,
      lastScore: null
    }));
    
    // Fetch previous attempt
    if (quizzes[index]) {
      fetchUserAttempt(quizzes[index]._id);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  return (
    <div className="quiz-tab">
      {/* Debug Test Button */}
      <button 
        onClick={testQuizSystem} 
        style={{
          background: '#ff6b6b',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '8px',
          marginBottom: '1rem',
          cursor: 'pointer'
        }}
      >
        🧪 Test Quiz System
      </button>

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
                    setQuizState(prev => ({
                      ...prev,
                      selectedQuizIndex: index,
                      showQuizModal: false
                    }));
                  }}
                >
                  Preview Quiz
                </button>
              </div>
            ))}
          </div>
        </>
      ) : quizzes.length > 0 ? (
        <div className="quiz-list">
          {quizzes.map((quiz, index) => (
            <div key={quiz._id} className="quiz-card">
              <h4>{quiz.title}</h4>
              <p>{quiz.questions.length} questions</p>
              <p>{new Date(quiz.createdAt).toLocaleDateString()}</p>
              <button
                className="common-btn start-btn"
                onClick={() => startQuiz(index)}
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No quiz available for this course.</p>
      )}
    </div>
  );
};

export default QuizTab;
