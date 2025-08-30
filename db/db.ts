import { env } from "@/config/config";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log(`Database connection successfully`);
    });

    connection.on("error", (err) => {
      if (err) {
        console.log(`Database connection failed cause of ${err}`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.log(
      `Error comes from Database connection failed cause of ${error}`
    );
  }
};
