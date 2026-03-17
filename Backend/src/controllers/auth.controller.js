const User = require("../models/user.model");
const UserProgress = require("../models/userProgress.model");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
  const { fullName, email, password, confirmPassword, userType } = req.body;

  try {
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match", success: false });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters", success: false });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format", success: false });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    const user = await User.create({
      fullName,
      email,
      passwordHash: password,
      userType: userType || "normal",
    });

    if (user) {
      await UserProgress.create({
        userId: user._id,
        completedLessons: [],
        lessonsCompletedCount: 0,
        currentLesson: null,
        progressPercentage: 0,
        lastLessonAccessed: null,
        practiceWords: [],
      });

      res.status(201).json({
        success: true,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const loginUser = async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required", success: false });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (userType && user.userType !== userType) {
        return res.status(401).json({
          message: "User type does not match the account",
          success: false,
        });
      }
      user.lastLoginAt = new Date();
      await user.save();

      const progress = await UserProgress.findOne({ userId: user._id });
      res.json({
        success: true,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        token: generateToken(user._id),
        progress,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = { registerUser, loginUser };
