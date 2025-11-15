import { NextFunction, Request, Response } from "express";
import Product from "../models/ProductModel";
import logger from "../utils/logger";
import { AuthRequest } from "../middlewares/authMiddleware";
import User from "../models/UserModel";
import { imageUploadUtil } from "../helper/cloudinary";
import { v2 as cloudinary } from "cloudinary";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const uploadedImg = await imageUploadUtil(req.file?.buffer);

    const product = await Product.create({
      image: [
        {
          url: uploadedImg.secure_url,
          public_id: uploadedImg.public_id,
        },
      ],
      title,
      description,
      category,
      brand,
      price: Number(price),
      totalStock: totalStock ? Number(totalStock) : 0,
      averageReview: averageReview ? Number(averageReview) : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    logger.error(`Create product error ${error.message}`);
    next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find();
    if (!products) {
      return res
        .status(400)
        .json({ success: false, message: "Products not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched products successfully",
      products,
    });
  } catch (error: any) {
    logger.error(`Get all products error ${error.message}`);
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Fetched product by Id", product });
  } catch (error: any) {
    logger.error(`Get product by id error ${error.message}`);
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if ((req as AuthRequest).user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update products",
      });
    }

    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let updatedImage = product.image;
    // If new file uploaded
    if (req.file) {
      // delete old image first
      if (product.image && product.image[0]?.public_id) {
        await cloudinary.uploader.destroy(product.image[0].public_id);
      }

      const uploadedImg = await imageUploadUtil(req.file.buffer);

      updatedImage = [
        {
          url: uploadedImg.secure_url,
          public_id: uploadedImg.public_id,
        },
      ];
    }

    // update product fields
    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.price = req.body.price || product.price;
    product.totalStock = req.body.totalStock || product.totalStock;
    product.averageReview = req.body.averageReview || product.averageReview;
    product.image = updatedImage;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    logger.error(`Update product error ${error.message}`);
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    if ((req as AuthRequest).user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update products",
      });
    }

    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // delete cloudinary image (only 1 image)
    if (product.image && product.image[0]?.public_id) {
      await cloudinary.uploader.destroy(product.image[0].public_id);
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    logger.error(`Delete product error ${error.message}`);
    next(error);
  }
};
