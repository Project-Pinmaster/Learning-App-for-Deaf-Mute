const express = require("express");
const router = express.Router();
const voiceToTextController = require("../controllers/voiceToText.controller");

router.post("/", voiceToTextController.convertToSign);

module.exports = router;
