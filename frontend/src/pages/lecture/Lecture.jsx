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
  // const [pdf, setPdf] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("lectures");

  const [completed, setCompleted] = useState("");
  const [completedLec, setCompletedLec] = useState("");
  const [lectLength, setLectLength] = useState("");
  const [progress, setProgress] = useState([]);

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

  // const changePdfHandler = (e) => {
  //   setPdf(e.target.files[0]);
  // };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    if (video) myForm.append("file", video);
    // if (pdf) myForm.append("pdf", pdf);

    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        authConfig
      );
      toast.success(data.message);
      setShow(false);
      setBtnLoading(false);
      fetchLectures();
      setTitle("");
      setDescription("");
      setvideo("");
      // setPdf("");
      setVideoPrev("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture")) {
      try {
        const { data } = await axios.delete(
          `${server}/api/lecture/${id}`,
          authConfig
        );
        toast.success(data.message);
        fetchLectures();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const addProgress = async (id) => {
    try {
      await axios.post(
        `${server}/api/user/progress?course=${params.id}&lectureId=${id}`,
        {},
        authConfig
      );
      fetchProgress();
    } catch (error) {
      console.log(error);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <>
      {user?.role !== "admin" && (
        <div className="progress">
          Lecture completed - {completedLec} out of {lectLength}
          <br />
          <progress value={completed} max={100}></progress> {completed} %
        </div>
      )}

      <div className="lecture-page">
        <div className="left">
          {lecLoading ? (
            <Loading />
          ) : (
            <>
              {lecture.video ? (
                <>
                  {lecture.video && (
                    <video
                      src={`${server}/${lecture.video}`}
                      width={"100%"}
                      controls
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      disableRemotePlayback
                      autoPlay
                      onEnded={() => addProgress(lecture._id)}
                    ></video>
                  )}

                  {/* {lecture.pdf && (
                    <div style={{ marginTop: "1rem" }}>
                      <h4>Download Lecture PDF:</h4>
                      <a
                        href={`${server}/${lecture.pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="common-btn"
                      >
                        View / Download PDF
                      </a>
                    </div>
                  )} */}

                  <h1>{lecture.title}</h1>
                  <h3>{lecture.description}</h3>
                </>
              ) : (
                <h1>Please Select a Lecture</h1>
              )}
            </>
          )}
        </div>

        <div className="right">
          {/* Tab bar */}
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === "lectures" ? "active" : ""}`}
              onClick={() => setActiveTab("lectures")}
            >
              📚 Lectures
            </button>
            <button
              className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("quiz")}
            >
              ❓ Quiz
            </button>
          </div>

          {/* Conditional Tabs */}
          {activeTab === "lectures" && (
            <>
              {user && user.role === "admin" && (
                <button
                  className="common-btn"
                  onClick={() => setShow(!show)}
                >
                  {show ? "Close" : "Add Lecture +"}
                </button>
              )}

              {show && (
                <div className="lecture-form">
                  <h2>Add Lecture</h2>
                  <form onSubmit={submitHandler}>
                    <label htmlFor="text">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />

                    <label htmlFor="text">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />

                    <input
                      type="file"
                      accept="video/*"
                      placeholder="Choose video"
                      onChange={changeVideoHandler}
                    />

                    {/* <input
                      type="file"
                      accept=".pdf"
                      placeholder="Choose PDF"
                      onChange={changePdfHandler}
                    /> */}

                    {videoPrev && (
                      <video
                        src={videoPrev}
                        alt=""
                        width={300}
                        controls
                      ></video>
                    )}

                    <button
                      disabled={btnLoading}
                      type="submit"
                      className="common-btn"
                    >
                      {btnLoading ? "Please Wait..." : "Add"}
                    </button>
                  </form>
                </div>
              )}

              {lectures && lectures.length > 0 ? (
                lectures.map((e, i) => (
                  <React.Fragment key={i}>
                    <div
                      onClick={() => fetchLecture(e._id)}
                      className={`lecture-number ${
                        lecture._id === e._id && "active"
                      }`}
                    >
                      {i + 1}. {e.title}{" "}
                      {progress[0] &&
                        progress[0].completedLectures.includes(e._id) && (
                          <span
                            style={{
                              background: "red",
                              padding: "2px",
                              borderRadius: "6px",
                              color: "greenyellow",
                            }}
                          >
                            <TiTick />
                          </span>
                        )}
                    </div>
                    {user && user.role === "admin" && (
                      <button
                        className="common-btn"
                        style={{ background: "red" }}
                        onClick={() => deleteHandler(e._id)}
                      >
                        Delete {e.title}
                      </button>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <p>No Lectures Yet!</p>
              )}
            </>
          )}

          {activeTab === "quiz" && (
            <QuizTab courseId={params.id} authConfig={authConfig} user={user} />

          )}
        </div>
      </div>
    </>
  );
};

export default Lecture;
