const express = require("express");
const Controller = require("../controllers/controller");

const router = express.Router();

router.post("/login", Controller.postLogin);
router.post("/google-login", Controller.postGoogleLogin);

module.exports = router;
