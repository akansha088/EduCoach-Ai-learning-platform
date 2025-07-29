import React from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import { UserData } from "../../context/UserContext";
import axios from "axios";
import { server } from "../../main";
import toast from "react-hot-toast";
import { useState } from "react";

const Courses = () => {
  const { courses, fetchCourses } = CourseData();
  const { user } = UserData();

  // Add Course form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const categories = [
    "Web Development",
    "App Development",
    "Game Development",
    "Data Science",
    "Artificial Intelligence",
  ];

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    const myForm = new FormData();
    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("category", category);
    myForm.append("price", price);
    myForm.append("createdBy", createdBy);
    myForm.append("duration", duration);
    myForm.append("file", image);
    try {
      const { data } = await axios.post(`${server}/api/course/new`, myForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success(data.message);
      setBtnLoading(false);
      await fetchCourses();
      setTitle("");
      setDescription("");
      setCategory("");
      setPrice("");
      setCreatedBy("");
      setDuration("");
      setImage("");
      setImagePrev("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setBtnLoading(false);
    }
  };

  console.log(courses);
  return (
    <div className="courses">
      <h2>Available Courses</h2>
      {user && user.role === "admin" && (
        <div className="add-course-form-container" style={{marginBottom: 40}}>
          <h3>Add New Course</h3>
          <form onSubmit={submitHandler} className="course-form form-grid">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required />
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" required />
            <input type="text" value={createdBy} onChange={e => setCreatedBy(e.target.value)} placeholder="Created By" required />
            <select value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="">Select Category</option>
              {categories.map(cat => <option value={cat} key={cat}>{cat}</option>)}
            </select>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (hours)" required />
            <input type="file" accept="image/*" onChange={changeImageHandler} required />
            {imagePrev && <img src={imagePrev} alt="Preview" style={{width: 100, margin: 10}} />}
            <button type="submit" disabled={btnLoading}>{btnLoading ? "Uploading..." : "Add Course"}</button>
          </form>
        </div>
      )}
      <div className="course-container">
        {courses && courses.length > 0 ? (
          courses.map((e) => <CourseCard key={e._id} course={e} />)
        ) : (
          <p>No Courses Yet!</p>
        )}
      </div>
    </div>
  );
};

export default Courses;
