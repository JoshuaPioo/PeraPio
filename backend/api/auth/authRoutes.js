import express from "express";
import {
  register,
  verify,
  reverify,
  login,
  logout,
  forgotPassword,
  verifyOTP,
  changePassword,
} from "./authController.js";

const router = express.Router();

router.post("/register", register);
router.get("/verify", verify);
router.post("/reverify", reverify);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/:email", verifyOTP);
router.post("/change-password/:email", changePassword);

export default router;
