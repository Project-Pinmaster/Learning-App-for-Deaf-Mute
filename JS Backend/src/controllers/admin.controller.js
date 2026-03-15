const User = require("../models/user.model");
const UserProgress = require("../models/userProgress.model");
const Lesson = require("../models/lesson.model");

const ACTIVE_DAYS = 7;

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    const progressList = await UserProgress.find().lean();
    const progressMap = new Map(
      progressList.map((item) => [String(item.userId), item])
    );

    const rows = users.map((user) => {
      const progress = progressMap.get(String(user._id)) || {};
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        lastLoginAt: user.lastLoginAt,
        lessonsCompleted: progress.lessonsCompletedCount || 0,
        progressPercentage: progress.progressPercentage || 0,
      };
    });

    res.json({ success: true, users: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminProgress = async (req, res) => {
  try {
    const [totalUsers, totalLessons, users, progressList] = await Promise.all([
      User.countDocuments(),
      Lesson.countDocuments(),
      User.find().lean(),
      UserProgress.find().lean(),
    ]);

    const totalCompletedLessons = progressList.reduce(
      (sum, item) => sum + (item.lessonsCompletedCount || 0),
      0
    );

    const averageLessonsCompleted =
      totalUsers > 0 ? totalCompletedLessons / totalUsers : 0;

    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - ACTIVE_DAYS);
    cutoff.setHours(0, 0, 0, 0);

    const activeUsers = users.filter(
      (user) => user.lastLoginAt && new Date(user.lastLoginAt) >= cutoff
    ).length;

    const activeLearners = progressList.filter(
      (item) =>
        item.lastLessonAccessed && new Date(item.lastLessonAccessed) >= cutoff
    ).length;

    const completionRate =
      totalLessons > 0
        ? Math.round((averageLessonsCompleted / totalLessons) * 100)
        : 0;

    const activeUsersSeries = Array.from({ length: ACTIVE_DAYS }).map(
      (_, index) => {
        const date = new Date();
        date.setDate(now.getDate() - (ACTIVE_DAYS - 1 - index));
        date.setHours(0, 0, 0, 0);
        const next = new Date(date);
        next.setDate(date.getDate() + 1);
        const count = users.filter(
          (user) =>
            user.lastLoginAt &&
            new Date(user.lastLoginAt) >= date &&
            new Date(user.lastLoginAt) < next
        ).length;
        return {
          label: date.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          count,
        };
      }
    );

    const progressBuckets = {
      "0-25%": 0,
      "26-50%": 0,
      "51-75%": 0,
      "76-100%": 0,
    };

    progressList.forEach((item) => {
      const pct = item.progressPercentage || 0;
      if (pct <= 25) progressBuckets["0-25%"] += 1;
      else if (pct <= 50) progressBuckets["26-50%"] += 1;
      else if (pct <= 75) progressBuckets["51-75%"] += 1;
      else progressBuckets["76-100%"] += 1;
    });

    res.json({
      success: true,
      summary: {
        totalUsers,
        totalHandicap: users.filter((user) => user.userType === "handicap")
          .length,
        totalNormal: users.filter((user) => user.userType === "normal").length,
        activeUsers,
        totalLessons,
        averageLessonsCompleted,
        totalCompletedLessons,
        activeLearners,
      },
      charts: {
        completionRate,
        activeUsersSeries,
        progressDistribution: Object.entries(progressBuckets).map(
          ([label, count]) => ({ label, count })
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminUsers, getAdminProgress };
