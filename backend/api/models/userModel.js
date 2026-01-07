import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,

  isVerified: { type: Boolean, default: false },
  token: String,

  otp: String,
  otpExpiry: Date,

  isLoggedIn: { type: Boolean, default: false },
});

export const User = mongoose.model("User", userSchema);
