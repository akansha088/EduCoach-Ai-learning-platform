import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";
import QuizTab from "../../components/quiz/QuizTab";

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setvideo] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("lectures");
  const [quizzes, setQuizzes] = useState([]);

  const [completed, setCompleted] = useState("");
  const [completedLec, setCompletedLec] = useState("");
  const [lectLength, setLectLength] = useState("");
  const [progress, setProgress] = useState([]);

  // Quiz state for fullscreen
  const [quizState, setQuizState] = useState({
    selectedQuizIndex: null,
    showQuizModal: false,
    userAnswers: {},
    attemptId: null,
    attemptLoading: false,
    showScore: false,
    lastScore: null
  });

  const params = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  if (user && user.role !== "admin" && !user.subscription.includes(params.id)) {
    return navigate("/");
  }

  useEffect(() => {
    fetchLectures();
    fetchProgress();
    fetchQuizzes();
  }, []);

  async function fetchLectures() {
    try {
      const { data } = await axios.get(
        `${server}/api/lectures/${params.id}`,
        authConfig
      );
      setLectures(data.lectures);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function fetchQuizzes() {
    try {
      const { data } = await axios.get(`${server}/api/user/quiz/${params.id}`, authConfig);
      setQuizzes(data.quiz);
    } catch (error) {
      setQuizzes([]);
    }
  }

  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(
        `${server}/api/lecture/${id}`,
        authConfig
      );
      setLecture(data.lecture);
      setLecLoading(false);
    } catch (error) {
      console.log(error);
      setLecLoading(false);
    }
  }

  async function fetchProgress() {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${params.id}`,
        authConfig
      );
      setCompleted(data.courseProgressPercentage);
      setCompletedLec(data.completedLectures);
      setLectLength(data.allLectures);
      setProgress(data.progress);
    } catch (error) {
      console.log(error);
    }
  }

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setvideo(file);
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", video);

    try {
      const { data } = await axios.post(
        `${server}/api/admin/lecture/${params.id}`,
        formData,
        authConfig
      );
      toast.success(data.message);
      setTitle("");
      setDescription("");
      setvideo("");
      setVideoPrev("");
      setShow(false);
      fetchLectures();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    }
    setBtnLoading(false);
  };

  const deleteHandler = async (id) => {
    try {
      const { data } = await axios.delete(
        `${server}/api/admin/lecture/${id}`,
        authConfig
      );
      toast.success(data.message);
      fetchLectures();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const addProgress = async (id) => {
    try {
      await axios.post(
        `${server}/api/user/progress`,
        { lecture: id },
        authConfig
      );
      fetchProgress();
    } catch (error) {
      console.log(error);
    }
  };

  const getProgressColor = (completed) => {
    if (completed >= 80) return "#00b894";
    if (completed >= 60) return "#fdcb6e";
    if (completed >= 40) return "#e17055";
    return "#d63031";
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

  if (loading) {
    return <Loading />;
  }

  const selectedQuiz = quizState.selectedQuizIndex !== null ? quizzes[quizState.selectedQuizIndex] : null;

  return (
    <div className="lecture-container">
      {/* Progress Header */}
      <div className="progress-header">
        <div className="progress-content">
          <div className="progress-info">
            <h3>Course Progress</h3>
            <p className="progress-stats">
              {completedLec} of {lectLength} lectures completed
            </p>
          </div>
          <div className="progress-visual">
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${completed}%`,
                  backgroundColor: getProgressColor(completed),
                }}
              ></div>
            </div>
            <span className="progress-percentage">{completed}%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lecture-main">
        {/* Video Section */}
        <div className="video-section">
          {lecLoading ? (
            <div className="loading-container">
              <Loading />
            </div>
          ) : (
            <>
              {lecture.video ? (
                <div className="video-player-container">
                  <div className="video-wrapper">
                    <video
                      src={`${server}/${lecture.video}`}
                      controls
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      disableRemotePlayback
                      autoPlay
                      onEnded={() => addProgress(lecture._id)}
                      className="video-player"
                    ></video>
                  </div>
                  
                  <div className="lecture-info">
                    <h1 className="lecture-title">{lecture.title}</h1>
                    <p className="lecture-description">{lecture.description}</p>
                    
                    <div className="lecture-meta">
                      <div className="meta-item">
                        <span className="meta-icon">📚</span>
                        <span>Lecture {lectures.findIndex(l => l._id === lecture._id) + 1} of {lectures.length}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span>Duration: ~15 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-lecture-selected">
                  <div className="no-lecture-content">
                    <span className="no-lecture-icon">🎥</span>
                    <h2>Select a Lecture</h2>
                    <p>Choose a lecture from the sidebar to start learning</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Section */}
        <div className="sidebar-section">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === "lectures" ? "active" : ""}`}
              onClick={() => setActiveTab("lectures")}
            >
              <span className="tab-icon">📚</span>
              <span className="tab-label">Lectures</span>
            </button>
            <button
              className={`tab-button ${activeTab === "quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("quiz")}
            >
              <span className="tab-icon">❓</span>
              <span className="tab-label">Quiz</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "lectures" && (
              <div className="lectures-tab">
                {/* Admin Add Lecture Button */}
                {user && user.role === "admin" && (
                  <button
                    className="add-lecture-btn"
                    onClick={() => setShow(!show)}
                  >
                    <span className="btn-icon">➕</span>
                    {show ? "Close Form" : "Add New Lecture"}
                  </button>
                )}

                {/* Add Lecture Form */}
                {show && (
                  <div className="lecture-form-container">
                    <div className="form-header">
                      <h3>Add New Lecture</h3>
                      <p>Upload video content for your students</p>
                    </div>
                    <form onSubmit={submitHandler} className="lecture-form">
                      <div className="form-group">
                        <label htmlFor="title">Lecture Title</label>
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter lecture title"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <input
                          type="text"
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter lecture description"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="video">Video File</label>
                        <input
                          type="file"
                          id="video"
                          accept="video/*"
                          onChange={changeVideoHandler}
                          className="file-input"
                          required
                        />
                      </div>

                      {videoPrev && (
                        <div className="video-preview">
                          <h4>Video Preview:</h4>
                          <video
                            src={videoPrev}
                            controls
                            className="preview-video"
                          ></video>
                        </div>
                      )}

                      <button
                        disabled={btnLoading}
                        type="submit"
                        className="submit-btn"
                      >
                        {btnLoading ? (
                          <>
                            <span className="loading-spinner"></span>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <span className="btn-icon">📤</span>
                            Upload Lecture
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Lectures List */}
                <div className="lectures-list">
                  <h3 className="list-title">Course Lectures</h3>
                  {lectures && lectures.length > 0 ? (
                    <div className="lecture-items">
                      {lectures.map((e, i) => (
                        <div key={i} className="lecture-item-wrapper">
                          <div
                            onClick={() => fetchLecture(e._id)}
                            className={`lecture-item ${
                              lecture._id === e._id && "active"
                            }`}
                          >
                            <div className="lecture-number">
                              <span className="number">{i + 1}</span>
                              {progress[0] &&
                                progress[0].completedLectures.includes(e._id) && (
                                  <span className="completion-badge">
                                    <TiTick />
                                  </span>
                                )}
                            </div>
                            <div className="lecture-details">
                              <h4 className="lecture-name">{e.title}</h4>
                              <p className="lecture-duration">~15 min</p>
                            </div>
                            <div className="lecture-status">
                              {progress[0] &&
                                progress[0].completedLectures.includes(e._id) ? (
                                  <span className="status-completed">✓ Completed</span>
                                ) : (
                                  <span className="status-pending">⏳ Pending</span>
                                )}
                            </div>
                          </div>
                          
                          {user && user.role === "admin" && (
                            <button
                              className="delete-lecture-btn"
                              onClick={() => deleteHandler(e._id)}
                            >
                              <span className="delete-icon">🗑️</span>
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-lectures">
                      <span className="no-lectures-icon">📚</span>
                      <p>No lectures available yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "quiz" && (
              <div className="quiz-tab-container">
                <QuizTab 
                  courseId={params.id} 
                  authConfig={authConfig} 
                  user={user}
                  quizState={quizState}
                  setQuizState={setQuizState}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Quiz - Rendered outside of layout constraints */}
      {quizState.selectedQuizIndex !== null && quizState.showQuizModal && user?.role !== "admin" && selectedQuiz && (
        <div className="quiz-fullscreen">
          <div className="fullscreen-header">
            <div className="header-content">
              <h2>{selectedQuiz.title}</h2>
              <div className="header-actions">
                <button 
                  className="fullscreen-close-btn"
                  onClick={() => {
                    setQuizState(prev => ({
                      ...prev,
                      showQuizModal: false,
                      selectedQuizIndex: null
                    }));
                  }}
                >
                  <span>✖</span>
                  <span className="close-text">Close Quiz</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="fullscreen-content">
            <div className="quiz-container">
              {quizState.attemptLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading your previous attempt...</p>
                </div>
              ) : (
                <>
                  {selectedQuiz.questions.map((q, idx) => (
                    <div key={q._id || idx} className="fullscreen-question">
                      <div className="question-header">
                        <span className="question-number">Question {idx + 1}</span>
                        <span className="question-type">{q.type.toUpperCase()}</span>
                      </div>
                      <p className="question-text">{q.question}</p>
                      
                      {(q.type === "mcq" || q.type === "truefalse") ? (
                        <div className="options-container">
                          {q.options.map((option, i) => (
                            <label key={i} className="fullscreen-option">
                              <input
                                type="radio"
                                name={`q-${q._id || idx}`}
                                value={option}
                                checked={quizState.userAnswers[q._id || q.question] === option}
                                onChange={() => handleUserAnswer(q._id || q.question, option)}
                              />
                              <span className="option-text">{option}</span>
                              <div className="option-checkmark"></div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-answer-container">
                          <textarea
                            placeholder="Type your answer here..."
                            value={quizState.userAnswers[q._id || q.question] || ""}
                            onChange={e => handleUserAnswer(q._id || q.question, e.target.value)}
                            className="fullscreen-textarea"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="fullscreen-actions">
                    <button
                      className="fullscreen-submit-btn"
                      onClick={() => handleUserSubmit(selectedQuiz)}
                      disabled={quizState.attemptLoading}
                    >
                      {quizState.attemptId ? "Update Quiz" : "Submit Quiz"}
                    </button>
                  </div>
                  
                  {quizState.showScore && (
                    <div className="fullscreen-score">
                      <div className="score-card">
                        <div className="score-header">
                          <h3>Quiz Completed!</h3>
                          <div className="score-circle">
                            <span className="score-number">{quizState.lastScore}</span>
                            <span className="score-total">/{selectedQuiz.questions.length}</span>
                          </div>
                        </div>
                        <div className="score-message">
                          {quizState.lastScore === selectedQuiz.questions.length 
                            ? "🎉 Perfect Score! Excellent work!" 
                            : quizState.lastScore >= selectedQuiz.questions.length * 0.8
                            ? "👍 Great job! You did well!"
                            : "📚 Good attempt! Keep practicing!"}
                        </div>
                        <button
                          className="retry-btn"
                          onClick={() => {
                            setQuizState(prev => ({
                              ...prev,
                              userAnswers: {},
                              showScore: false,
                              lastScore: null,
                              attemptId: null
                            }));
                          }}
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lecture;
