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

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/loginStepOne", loginStepOne);
router.post("/verifyLogin", verifyLogin);
router.post("/refreshToken", refreshToken);
router.post("/changePassword", changePassword);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword", resetPassword);
router.post("/logout", logout);

export default router;
