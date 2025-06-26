const express = require("express");
const Controller = require("../controllers/controller");
const isLoggedIn = require("../middlewares/authn");

const router = express.Router();

// ========== user ==========
router.post("/login", Controller.postLogin);
router.post("/google-login", Controller.postGoogleLogin);
router.post("/register", Controller.postRegister);

router.use(isLoggedIn);

// ========== message ==========
router.get("/messages", Controller.getMessages);
// router.post("/messages", Controller.postMessage);
// router.put("/messages/:id", Controller.updateMessageById);
// router.delete("/messages/:id", Controller.deleteMessageById);

router.patch("/messages", Controller.updateMessageIsSummarized);
router.get("/summary", Controller.getSummary);
router.patch("/users/:id", Controller.updateUserById);

module.exports = router;
