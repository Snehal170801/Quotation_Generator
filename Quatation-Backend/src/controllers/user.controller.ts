import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { UserRole } from "../generated/prisma/client.js";

const PERMISSION_KEYS = [
  "canAccessSalesPanel",
  "canCreateOrder",
  "canFinalizeOrder",
  "canDownloadPDF",
  "canViewOrders",
] as const;

// POST /api/users — admin only
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res
        .status(400)
        .json({ message: "name, email, password and role are required." });

    if (!["admin", "sales"].includes(role))
      return res
        .status(400)
        .json({ message: "role must be 'admin' or 'sales'." });

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role as UserRole,
      },
    });

    return res.status(201).json({ user: sanitize(user) });
  } catch {
    return res.status(500).json({ message: "Server error creating user." });
  }
};

// GET /api/users — admin only
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ users: users.map(sanitize) });
  } catch {
    return res.status(500).json({ message: "Server error fetching users." });
  }
};

// PUT /api/users/:id — admin only
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, email, role, isActive, password, permissions } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email.toLowerCase();
    if (role !== undefined) {
      if (!["admin", "sales"].includes(role))
        return res
          .status(400)
          .json({ message: "role must be 'admin' or 'sales'." });
      updates.role = role;
    }
    if (isActive !== undefined) updates.isActive = isActive;
    if (password) updates.password = await bcrypt.hash(password, 10);

    if (permissions && typeof permissions === "object") {
      for (const key of PERMISSION_KEYS) {
        if (typeof permissions[key] === "boolean") {
          updates[key] = permissions[key];
        }
      }
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: updates,
      });
      return res.status(200).json({ user: sanitize(user) });
    } catch {
      return res.status(404).json({ message: "User not found." });
    }
  } catch {
    return res.status(500).json({ message: "Server error updating user." });
  }
};

// DELETE /api/users/:id — admin only
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user
      .update({
        where: { id: req.params["id"] as string },
        data: { isActive: false },
      })
      .catch(() => null);

    if (!user) return res.status(404).json({ message: "User not found." });
    return res
      .status(200)
      .json({ message: "User deactivated.", user: sanitize(user) });
  } catch {
    return res.status(500).json({ message: "Server error deactivating user." });
  }
};

function sanitize(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  canAccessSalesPanel: boolean;
  canCreateOrder: boolean;
  canFinalizeOrder: boolean;
  canDownloadPDF: boolean;
  canViewOrders: boolean;
  createdAt: Date;
}) {
  return {
    _id: user.id, // kept as _id to avoid breaking frontend expecting this key
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    permissions: {
      canAccessSalesPanel: user.canAccessSalesPanel,
      canCreateOrder: user.canCreateOrder,
      canFinalizeOrder: user.canFinalizeOrder,
      canDownloadPDF: user.canDownloadPDF,
      canViewOrders: user.canViewOrders,
    },
    createdAt: user.createdAt,
  };
}
