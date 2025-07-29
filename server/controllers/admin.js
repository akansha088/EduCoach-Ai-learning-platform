import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";
import { Quiz } from "../models/Quiz.js";
import { QuizAttempt } from "../models/QuizAttempt.js";


export const createCourse = TryCatch(async (req, res) => {
  console.log("🔧 createCourse called");

  const { title, description, category, createdBy, duration, price } = req.body;
  const image = req.file;

  console.log("📥 Body:", { title, description, category, createdBy, duration, price });
  console.log("🖼️ File:", image);

  if (!image) {
    return res.status(400).json({ message: "Image upload failed or missing" });
  }

  try {
    const course = await Courses.create({
      title,
      description,
      category,
      createdBy,
      image: image.path, // no optional chaining here, image already validated
      duration,
      price,
    });

    console.log("✅ Course created:", course);

    res.status(201).json({
      message: "Course Created Successfully",
    });
  } catch (err) {
    console.error("❌ Error creating course:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      message: "No Course with this ID",
    });
  }

  const { title, description } = req.body;

  // Use req.file for single file upload
  const videoFile = req.file;

  if (!videoFile) {
    return res.status(400).json({ message: "Please upload a video" });
  }

  const lecture = await Lecture.create({
    title,
    description,
    video: videoFile.path || "",
    course: course._id,
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});


export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  rm(lecture.video, () => {
    console.log("Video deleted");
  });

  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      await unlinkAsync(lecture.video);
      console.log("video deleted");
    })
  );

  rm(course.image, () => {
    console.log("image deleted");
  });

  await Lecture.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCoures = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCoures,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  if (req.user.mainrole !== "superadmin")
    return res.status(403).json({
      message: "This endpoint is assign to superadmin",
    });
  const user = await User.findById(req.params.id);

  if (user.role === "user") {
    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (user.role === "admin") {
    user.role = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated",
    });
  }
});

export const createQuizForCourse = TryCatch(async (req, res) => {
  const { title, questions } = req.body;
  const course = req.params.courseId;

  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate each question
  for (let q of questions) {
    if (!q.question || !q.correctAnswer || !q.type) {
      return res.status(400).json({ message: "Each question must have a question, correct answer, and type." });
    }
    if (q.type === "mcq" && (!q.options || q.options.length < 2)) {
      return res.status(400).json({ message: "MCQ questions must have at least 2 options." });
    }
    if (q.type === "truefalse") {
      q.options = ["True", "False"];
    }
    if (q.type === "short") {
      q.options = [];
    }
  }

  const quiz = await Quiz.create({
    title,
    course,
    questions,
    createdBy: req.user._id,
  });

  res.status(201).json({
    message: "Quiz uploaded successfully",
    quiz,
  });
});

