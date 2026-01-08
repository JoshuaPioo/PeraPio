import { User } from "../models/userModel.js";
import { Session } from "../models/sessionModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../emailVerifier/verifyEmail.js";
import { sendOTPMail } from "../emailVerifier/sendOTPMail.js";

// =======================
// REGISTER
// =======================
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    await sendVerificationEmail(email, token);

    user.token = token;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
// =======================
// VERIFY EMAIL
// =======================
export const verify = async (req, res) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ message: "Invalid token" });

    const token = header.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch {
      return res.status(401).json({ message: "Token expired or invalid" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    user.token = null;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// =======================
// RESEND VERIFICATION EMAIL
// =======================
export const reverify = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    user.token = token;
    await user.save();

    await sendVerificationEmail(email, token);

    res.json({
      success: true,
      message: "Verification email resent",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// =======================
// LOGIN
// =======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Email not verified" });

    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10d",
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "30d",
    });

    user.isLoggedIn = true;
    await user.save();

    await Session.deleteMany({ userId: user._id });
    await Session.create({ userId: user._id });

    res.json({
      success: true,
      message: `Login successful`,
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// =======================
// LOGOUT
// =======================
export const logout = async (req, res) => {
  try {
    const userId = req.id;

    await Session.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// =======================
// FORGOT PASSWORD (SEND OTP)
// =======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPMail(email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// =======================
// VERIFY OTP
// =======================
export const verifyOTP = async (req, res) => {
  try {
    const { email } = req.params;
    const { otp } = req.body;

    if (!otp) return res.status(400).json({ message: "OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired" });

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// =======================
// CHANGE PASSWORD (AFTER OTP)
// =======================
export const changePassword = async (req, res) => {
  try {
    const { email } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
