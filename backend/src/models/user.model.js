import mongoose from "mongoose";
import { type } from "node:os";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    goals: {
      type: [String],
      default: null,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: null,
    },
    goal: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("user", userSchema);

export default userModel;
