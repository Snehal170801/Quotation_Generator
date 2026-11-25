import { Request, Response } from "express";
import prisma from "../config/db.js";
import { CategoryType } from "../generated/prisma/client.js";

const VALID_TYPES = ["product", "hardware", "software", "other"];

function toApiShape(category: {
  id: string;
  name: string;
  type: string;
  price: number | null;
  isActive: boolean;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: category.id,
    name: category.name,
    type: category.type,
    price: category.price,
    isActive: category.isActive,
    parent: category.parentId,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

// POST /api/categories/parent — admin only (create a new section)
export const createParent = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "name and type are required." });
    }

    if (!VALID_TYPES.includes(type)) {
      return res
        .status(400)
        .json({ message: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    const section = await prisma.category.create({
      data: {
        name,
        type: type as CategoryType,
        parentId: null,
      },
    });

    return res.status(201).json({ category: toApiShape(section) });
  } catch (error) {
    return res.status(500).json({ message: "Server error creating section." });
  }
};

// POST /api/categories/child — admin only (create an item under a section)
export const createChild = async (req: Request, res: Response) => {
  try {
    const { name, type, parent, price } = req.body;

    if (!name || !type || !parent) {
      return res
        .status(400)
        .json({ message: "name, type and parent are required." });
    }

    if (!VALID_TYPES.includes(type)) {
      return res
        .status(400)
        .json({ message: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    if (
      price !== undefined &&
      price !== null &&
      (typeof price !== "number" || price < 0)
    ) {
      return res
        .status(400)
        .json({ message: "price must be a non-negative number." });
    }

    const parentSection = await prisma.category.findUnique({
      where: { id: parent },
    });

    if (!parentSection || parentSection.parentId !== null) {
      return res
        .status(400)
        .json({ message: "parent must reference a valid top-level section." });
    }

    const child = await prisma.category.create({
      data: {
        name,
        type: type as CategoryType,
        parentId: parent,
        price: price ?? null,
      },
    });

    return res.status(201).json({ category: toApiShape(child) });
  } catch (error) {
    return res.status(500).json({ message: "Server error creating item." });
  }
};

// GET /api/categories/tree — all roles (full nested tree for the sales form)
export const getTree = async (_req: Request, res: Response) => {
  try {
    const parents = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const tree = parents.map((parent) => ({
      _id: parent.id,
      name: parent.name,
      type: parent.type,
      children: parent.children.map((child) => ({
        _id: child.id,
        name: child.name,
        type: child.type,
        price: child.price,
      })),
    }));

    return res.status(200).json({ tree });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error fetching category tree." });
  }
};

// GET /api/categories/parents — admin only (flat list of all sections)
export const getParents = async (_req: Request, res: Response) => {
  try {
    const parents = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ parents: parents.map(toApiShape) });
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching sections." });
  }
};

// GET /api/categories/:parentId/children — all roles (children of one section)
export const getChildren = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params as { parentId: string };

    const children = await prisma.category.findMany({
      where: { parentId, isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json({ children: children.map(toApiShape) });
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching children." });
  }
};

// PUT /api/categories/:id — admin only (rename / update an item or section)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, type, isActive, price } = req.body;

    const updates: Record<string, unknown> = {};

    if (name !== undefined) updates.name = name;
    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) {
        return res
          .status(400)
          .json({ message: `type must be one of: ${VALID_TYPES.join(", ")}` });
      }
      updates.type = type;
    }
    if (isActive !== undefined) updates.isActive = isActive;
    if (price !== undefined) {
      if (price !== null && (typeof price !== "number" || price < 0)) {
        return res
          .status(400)
          .json({ message: "price must be a non-negative number or null." });
      }
      updates.price = price;
    }

    try {
      const category = await prisma.category.update({
        where: { id },
        data: updates,
      });
      return res.status(200).json({ category: toApiShape(category) });
    } catch {
      return res.status(404).json({ message: "Category not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error updating category." });
  }
};

// DELETE /api/categories/:id — admin only (delete an item or section)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    if (category.parentId === null) {
      await prisma.$transaction([
        prisma.category.deleteMany({ where: { parentId: id } }),
        prisma.category.delete({ where: { id } }),
      ]);
    } else {
      await prisma.category.delete({ where: { id } });
    }

    return res.status(200).json({ message: "Category deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting category." });
  }
};
