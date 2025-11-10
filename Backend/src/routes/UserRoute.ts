import express from "express";
import {
  register,
  verifyEmail,
  loginStepOne,
  verifyLogin,
} from "../controllers/UserController";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/loginStepOne", loginStepOne);
router.post("/verifyLogin", verifyLogin);

export default router;
