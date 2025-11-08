import mongoose from "mongoose";

export const connectDb: () => Promise<void> = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("Database connected");
  } catch (error : any) {
    console.log("Error in db connection",error.message);
    process.exit(1)
  }
};


