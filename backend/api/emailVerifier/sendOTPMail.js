import nodemailer from "nodemailer";

export const sendOTPMail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Expense Monitor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h2>Password Reset OTP</h2>
      <p>Your OTP code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};
