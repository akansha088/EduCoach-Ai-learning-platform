import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  score: Number,
  total: Number,
  responses: [{ questionId: String, selected: String }],
  createdAt: { type: Date, default: Date.now },
});

export const QuizAttempt = mongoose.model("QuizAttempt", schema);