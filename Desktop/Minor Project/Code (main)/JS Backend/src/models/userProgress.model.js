const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    completedLessons: [{ type: String }],
    lessonsCompletedCount: { type: Number, default: 0 },
    currentLesson: { type: String, default: null },
    progressPercentage: { type: Number, default: 0 },
    lastLessonAccessed: { type: Date, default: null },
    practiceWords: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProgress", userProgressSchema);
