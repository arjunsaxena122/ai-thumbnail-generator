import { AvailableUserEnumRoles, UserEnumRoles } from "@/utils/constant.util";
import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "username is required"],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "password is required"],
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: AvailableUserEnumRoles,
      default: UserEnumRoles.USER,
    },
    isEmailVerificationToken: {
      type: String,
    },
    isEmailVerificationTokenExpiry: {
      type: Date,
    },
    forgetPasswordToken: {
      type: String,
    },
    forgetPasswordTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Auth =
  mongoose.models.users || mongoose.model("users", authSchema);
