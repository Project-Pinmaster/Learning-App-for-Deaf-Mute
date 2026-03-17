const UserProgress = require("../models/userProgress.model");

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

module.exports = { getUserProgress };
