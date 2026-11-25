import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";

// POST /api/auth/login — public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        code: "USER_NOT_FOUND",
        message: "No account found with this email address.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        code: "ACCOUNT_DISABLED",
        message:
          "Your account has been deactivated. Please contact your administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        code: "WRONG_PASSWORD",
        message: "Incorrect password. Please try again.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: {
          canAccessSalesPanel: user.canAccessSalesPanel,
          canCreateOrder: user.canCreateOrder,
          canFinalizeOrder: user.canFinalizeOrder,
          canDownloadPDF: user.canDownloadPDF,
          canViewOrders: user.canViewOrders,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};

// GET /api/auth/me — all roles (requires authMiddleware)
export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        canAccessSalesPanel: true,
        canCreateOrder: true,
        canFinalizeOrder: true,
        canDownloadPDF: true,
        canViewOrders: true,
        createdAt: true,
        updatedAt: true,
        // password intentionally excluded
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching user." });
  }
};

// PUT /api/auth/password — all roles (change own password)
export const updatePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "newPassword must be at least 6 characters." });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error updating password." });
  }
};

// POST /api/auth/logout — all roles
export const logout = async (_req: Request, res: Response) => {
  return res.status(200).json({ message: "Logged out successfully." });
};
