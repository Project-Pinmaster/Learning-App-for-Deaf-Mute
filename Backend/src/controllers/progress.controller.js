const UserProgress = require("../models/userProgress.model");
const Lesson = require("../models/lesson.model");

const getUserProgress = async (req, res) => {
  const { userId } = req.params;

  try {
    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({ success: false, message: "Progress not found" });
    }

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserProgress = async (req, res) => {
  const { userId } = req.params;
  const { lessonTitle, totalLessons } = req.body;

  if (!lessonTitle) {
    return res.status(400).json({ success: false, message: "lessonTitle is required" });
  }

  try {
    let progress = await UserProgress.findOne({ userId });

    if (!progress) {
      progress = await UserProgress.create({
        userId,
        completedLessons: [],
        lessonsCompletedCount: 0,
        currentLesson: null,
        progressPercentage: 0,
        lastLessonAccessed: null,
        practiceWords: [],
      });
    }

    const completedSet = new Set(progress.completedLessons || []);
    completedSet.add(lessonTitle);
    progress.completedLessons = Array.from(completedSet);
    progress.lessonsCompletedCount = progress.completedLessons.length;
    progress.currentLesson = lessonTitle;
    progress.lastLessonAccessed = new Date();

    let lessonTotal = Number(totalLessons) || 0;
    if (!lessonTotal) {
      lessonTotal = await Lesson.countDocuments();
    }

    if (lessonTotal > 0) {
      progress.progressPercentage = Math.round(
        (progress.lessonsCompletedCount / lessonTotal) * 100
      );
    }

    await progress.save();

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProgress, updateUserProgress };
