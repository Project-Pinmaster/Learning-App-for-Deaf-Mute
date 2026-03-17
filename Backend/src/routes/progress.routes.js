const express = require("express");
const { getUserProgress } = require("../controllers/progress.controller");

const router = express.Router();

router.get("/:userId", getUserProgress);

module.exports = router;
