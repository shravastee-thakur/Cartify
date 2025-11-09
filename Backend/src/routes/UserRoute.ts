import express from "express";
import { Register } from "../controllers/UserController";
import { registerSchema } from "../utils/zod";

const router = express.Router();

router.post("/register", Register);
router.post("/login", Register);

export default router;
