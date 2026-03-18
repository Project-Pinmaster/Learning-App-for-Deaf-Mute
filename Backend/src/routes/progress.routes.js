const express = require("express");
const { getUserProgress, updateUserProgress } = require("../controllers/progress.controller");

const router = express.Router();

router.get("/:userId", getUserProgress);
router.put("/:userId", updateUserProgress);

module.exports = router;
