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
  updateUser,
  getUser,
} from "../controllers/UserController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/loginStepOne", loginStepOne);
router.post("/verifyLogin", verifyLogin);
router.get("/getUser", requireAuth, getUser);
router.post("/refreshToken", refreshToken);
router.post("/changePassword", requireAuth, changePassword);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword", resetPassword);
router.put("/updateUser", requireAuth, updateUser);
router.post("/logout", logout);

export default router;
