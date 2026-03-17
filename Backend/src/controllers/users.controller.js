const User = require("../models/user.model");

const changeEmail = async (req, res) => {
  const { userId, email } = req.body;
  if (!userId || !email) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  try {
    const exists = await User.findOne({ email, _id: { $ne: userId } });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { email },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changeName = async (req, res) => {
  const { userId, fullName } = req.body;
  if (!userId || !fullName) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    user.passwordHash = newPassword;
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { changeEmail, changeName, changePassword };
