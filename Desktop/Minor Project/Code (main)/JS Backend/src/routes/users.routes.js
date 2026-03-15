const express = require("express");
const { changeEmail, changeName, changePassword } = require("../controllers/users.controller");

const router = express.Router();

router.post("/change-email", changeEmail);
router.post("/change-name", changeName);
router.post("/change-password", changePassword);

module.exports = router;
