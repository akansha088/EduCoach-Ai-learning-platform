// middlewares/isAuth.js
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import dotenv from 'dotenv';
dotenv.config();

// ✅ AUTHENTICATION MIDDLEWARE
export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // ✅ Get token from "Authorization" header

    // ✅ Validate header format: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "Please Login First" });
    }

    const token = authHeader.split(" ")[1]; // ✅ Extract the actual token

    // ✅ Decode the token
    const decodedData = jwt.verify(token, process.env.Jwt_Sec);

    // ✅ Get user from DB
    req.user = await User.findById(decodedData._id);

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next(); // ✅ Allow request to continue
  } catch (error) {
    console.error("Auth error:", error.message); // 👀 Log error for debugging
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

// ✅ ADMIN CHECK MIDDLEWARE
export const isAdmin = (req, res, next) => {
  try {
    // ✅ Ensure user exists and has admin role
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not an admin" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
