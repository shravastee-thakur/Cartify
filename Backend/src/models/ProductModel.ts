import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductImage {
  url: string;
  public_id: string;
}

export interface IProduct extends Document {
  image: IProductImage[];
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  totalStock: number;
  averageReview: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    image: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalStock: {
      type: Number,
      default: 0,
    },
    averageReview: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema
);
export default Product;
