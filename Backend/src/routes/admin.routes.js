const express = require("express");
const { getAdminUsers, getAdminProgress } = require("../controllers/admin.controller");

const router = express.Router();

router.get("/users", getAdminUsers);
router.get("/progress", getAdminProgress);

module.exports = router;
