import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "VALIDATION_ERROR",
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    res.status(200).json({
      success: true,
      data: { token, user: { id: user._id, email: user.email } },
      error: null,
      message: "Login successful",
    });
  } catch (error: any) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to login",
    });
  }
};
