import mongoose from "mongoose";
import { config } from "../config/config.js";

export const connectDB = async () => {
  mongoose
    .connect(config.mongodb.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log("Database connection successfully !");
    })
    .catch((error) => {
      console.log("Database connection error : ", error);
    });
};
