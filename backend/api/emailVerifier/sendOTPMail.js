import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendOTPMail = async (email, otp) => {
  if (!email) throw new Error("Email missing");

  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"PeraPio" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `<a href="${link}">Verify Email</a>`,
  });
};
