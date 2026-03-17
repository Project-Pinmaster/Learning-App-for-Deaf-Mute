const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["alphabet", "numbers", "words", "sentences"],
      required: true,
    },
    videoUrl: { type: String },
    difficulty: { type: String, default: "easy" },
    lastLearnedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
