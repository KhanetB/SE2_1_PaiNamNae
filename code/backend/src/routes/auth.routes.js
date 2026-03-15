const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const {
  loginSchema,
  changePasswordSchema,
  verifyUserSchema,
} = require("../validations/auth.validation");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", validate({ body: loginSchema }), authController.login);

// PUT /api/auth/change-password
router.put(
  "/change-password",
  protect,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);

// POST /api/auth/verify-user
router.post(
  "/verify-user",
  protect,
  validate({ body: verifyUserSchema }),
  authController.verifyUser,
);

// POST /api/auth/logout
router.get("/logout", authController.logout);

module.exports = router;
