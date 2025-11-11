import express from "express";
import {
  register,
  verifyEmail,
  loginStepOne,
  verifyLogin,
  refreshToken,
  logout,
  changePassword,
  resetPassword,
  forgetPassword,
} from "../controllers/UserController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/loginStepOne", loginStepOne);
router.post("/verifyLogin", verifyLogin);
router.post("/refreshToken", refreshToken);
router.post("/changePassword", requireAuth, changePassword);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword", resetPassword);
router.post("/logout", requireAuth, logout);

export default router;
