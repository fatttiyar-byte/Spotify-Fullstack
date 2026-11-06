
import { User } from "../model.js";
import Trycatch from "../Trycatch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = Trycatch(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({
      message: "کاربر یافت نشد."
    });
    return;
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json({
      message: "اطلاعات واردشده صحیح نیست."
    });
    return;
  }

  // Check JWT secret
  const JWT_SEC = process.env.JWT_SEC;

  if (!JWT_SEC) {
    throw new Error("JWT_SEC is not defined in environment variables");
  }

  // Generate token
  const token = jwt.sign(
    {
      _id: user._id.toString(),
      tokenVersion: user.tokenVersion
    },
    JWT_SEC,
    {
      expiresIn: "10d"
    }
  );

  // Send response
  res.status(200).json({
    success: true,
    message: "ورود با موفقیت انجام شد.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
});
