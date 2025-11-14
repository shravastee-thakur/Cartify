import { NextFunction, Request, Response } from "express";
import Product from "../models/ProductModel";
import logger from "../utils/logger";
import { AuthRequest } from "../middlewares/authMiddleware";
import User from "../models/UserModel";
import { success } from "zod";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      totalStock,
      averageReview,
    } = req.body;

    if (
      !(
        title &&
        description &&
        category &&
        brand &&
        price &&
        totalStock &&
        averageReview
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user.id;

    const user = await User.findById(userId);
  } catch (error: any) {
    logger.error(`Create product error ${error.message}`);
    next(error);
  }
};
