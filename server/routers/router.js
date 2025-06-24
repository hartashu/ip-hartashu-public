const express = require("express");
const Controller = require("../controllers/controller");

const router = express.Router();

router.post("/login", Controller.postLogin);
router.post("/google-login", Controller.postGoogleLogin);
router.post("/register", Controller.postRegister);

module.exports = router;
