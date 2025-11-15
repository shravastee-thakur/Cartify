import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/ProductController";
import upload from "../helper/cloudinary";
import { requireAuth } from "../middlewares/authMiddleware";
import allowRole from "../middlewares/roleMiddleware";

const router = express.Router();

router.post(
  "/createProduct",
  requireAuth,
  upload.single("image"),
  createProduct
);
router.get("/getAllProducts", getAllProducts);
router.get("/getProductById/:id", getProductById);
router.put(
  "/updateProduct/:id",
  requireAuth,
  allowRole("admin"),
  upload.single("image"),
  updateProduct
);
router.delete(
  "/deleteProduct/:id",
  requireAuth,
  allowRole("admin"),
  deleteProduct
);

export default router;
