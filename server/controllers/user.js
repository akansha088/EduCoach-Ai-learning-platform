import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMail, { sendForgotMail } from "../middlewares/sendMail.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Quiz } from "../models/Quiz.js";
import { QuizAttempt } from "../models/QuizAttempt.js";

export const register = TryCatch(async (req, res) => {
  const { email, name, password } = req.body;

  let user = await User.findOne({ email });

  if (user)
    return res.status(400).json({
      message: "User Already exists",
    });

  const hashPassword = await bcrypt.hash(password, 10);

  user = {
    name,
    email,
    password: hashPassword,
  };

  const otp = Math.floor(Math.random() * 1000000);

  const activationToken = jwt.sign(
    {
      user,
      otp,
    },
    process.env.Activation_Secret,
    {
      expiresIn: "5m",
    }
  );

  const data = {
    name,
    otp,
  };

  await sendMail(email, "E learning", data);

  res.status(200).json({
    message: "Otp send to your mail",
    activationToken,
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { otp, activationToken } = req.body;

  const verify = jwt.verify(activationToken, process.env.Activation_Secret);

  if (!verify)
    return res.status(400).json({
      message: "Otp Expired",
    });

  if (verify.otp !== otp)
    return res.status(400).json({
      message: "Wrong Otp",
    });

  await User.create({
    name: verify.user.name,
    email: verify.user.email,
    password: verify.user.password,
  });

  res.json({
    message: "User Registered",
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({
      message: "No User with this email",
    });

  const mathPassword = await bcrypt.compare(password, user.password);

  if (!mathPassword)
    return res.status(400).json({
      message: "wrong Password",
    });

  const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
    expiresIn: "15d",
  });

  res.json({
    message: `Welcome back ${user.name}`,
    token,
    user,
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({ user });
});

export const forgotPassword = TryCatch(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({
      message: "No User with this email",
    });

  const token = jwt.sign({ email }, process.env.Forgot_Secret);

  const data = { email, token };

  await sendForgotMail("E learning", data);

  user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

  await user.save();

  res.json({
    message: "Reset Password Link is send to you mail",
  });
});

export const resetPassword = TryCatch(async (req, res) => {
  const decodedData = jwt.verify(req.query.token, process.env.Forgot_Secret);

  const user = await User.findOne({ email: decodedData.email });

  if (!user)
    return res.status(404).json({
      message: "No user with this email",
    });

  if (user.resetPasswordExpire === null)
    return res.status(400).json({
      message: "Token Expired",
    });

  if (user.resetPasswordExpire < Date.now()) {
    return res.status(400).json({
      message: "Token Expired",
    });
  }

  const password = await bcrypt.hash(req.body.password, 10);

  user.password = password;

  user.resetPasswordExpire = null;

  await user.save();

  res.json({ message: "Password Reset" });
});

export const getCourseQuiz = TryCatch(async (req, res) => {
  const { courseId } = req.params;

  const quiz = await Quiz.find({ course: courseId });

  if (!quiz || quiz.length === 0) {
    return res.status(404).json({ message: "No quiz found for this course" });
  }

  res.status(200).json({
    success: true,
    quiz,
  });
});

// Submit a new quiz attempt
export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, responses, score, total } = req.body;
    const userId = req.user._id;
    // Always allow new attempts
    const attempt = await QuizAttempt.create({
      user: userId,
      quiz: quizId,
      responses,
      score,
      total,
    });
    res.status(201).json({ message: "Quiz submitted successfully", attempt });
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update an existing quiz attempt
export const updateQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { responses, score, total } = req.body;
    const userId = req.user._id;
    let attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    attempt.responses = responses;
    attempt.score = score;
    attempt.total = total;
    await attempt.save();
    res.status(200).json({ message: "Quiz attempt updated successfully", attempt });
  } catch (error) {
    console.error("Error updating quiz attempt:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Fetch a user's previous quiz attempt for a quiz
export const getQuizAttempt = async (req, res) => {
  try {
    const userId = req.user._id;
    const { quizId } = req.query;
    if (!quizId) {
      return res.status(400).json({ message: "quizId is required" });
    }
    const attempt = await QuizAttempt.findOne({ user: userId, quiz: quizId });
    res.status(200).json({ attempt });
  } catch (error) {
    console.error("Error fetching quiz attempt:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Fetch all quiz attempts for the logged-in user
export const getAllQuizAttempts = async (req, res) => {
  try {
    const userId = req.user._id;

    const attempts = await QuizAttempt.find({ user: userId })
      .populate({ path: "quiz", select: "title", strictPopulate: false });

    const validAttempts = attempts.filter(a => a.quiz && a.quiz.title);
    
    const totalAttempts = validAttempts.length;
    const uniqueQuizIds = new Set(validAttempts.map(a => a.quiz._id.toString()));
    const totalQuizzes = uniqueQuizIds.size;

    const totalScore = validAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const totalMax = validAttempts.reduce((sum, a) => sum + (a.total || 0), 0);
    const averageScore = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(2) : 0;

    res.status(200).json({
      totalQuizzes,
      totalAttempts,
      averageScore: parseFloat(averageScore),
      attempts: validAttempts, // still returning in case you want a table below
    });
  } catch (error) {
    console.error("❌ Error in quiz analytics:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
