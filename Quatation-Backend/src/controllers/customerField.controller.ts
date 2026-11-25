import { type Request, type Response } from "express";
import prisma from "../config/db.js";
import { FieldType } from "../generated/prisma/client.js";

function toApiShape(field: {
  id: string;
  name: string;
  type: string;
  required: boolean;
  order: number;
}) {
  return {
    _id: field.id,
    name: field.name,
    type: field.type,
    required: field.required,
    order: field.order,
  };
}

// GET /api/fields
export async function getFields(_req: Request, res: Response) {
  try {
    const fields = await prisma.customerField.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    res.json({ success: true, data: fields.map(toApiShape) });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch fields." });
  }
}

// POST /api/fields
export async function createField(req: Request, res: Response) {
  try {
    const { name, type = "text", required = false } = req.body;
    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Field name is required." });
    }

    const count = await prisma.customerField.count();
    const field = await prisma.customerField.create({
      data: {
        name: name.trim(),
        type: type as FieldType,
        required: !!required,
        order: count,
      },
    });

    res.status(201).json({ success: true, data: toApiShape(field) });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to create field." });
  }
}

// PUT /api/fields/:id
export async function updateField(req: Request, res: Response) {
  try {
    const { name, type, required } = req.body;
    const updates: Record<string, unknown> = {};

    if (name !== undefined) {
      if (!name.trim())
        return res
          .status(400)
          .json({ success: false, message: "Field name cannot be empty." });
      updates.name = name.trim();
    }
    if (type !== undefined) updates.type = type;
    if (required !== undefined) updates.required = !!required;

    try {
      const field = await prisma.customerField.update({
        where: { id: req.params["id"] as string },
        data: updates,
      });
      res.json({ success: true, data: toApiShape(field) });
    } catch {
      return res
        .status(404)
        .json({ success: false, message: "Field not found." });
    }
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to update field." });
  }
}

// DELETE /api/fields/:id
export async function deleteField(req: Request, res: Response) {
  try {
    try {
      await prisma.customerField.delete({
        where: { id: req.params["id"] as string },
      });
      res.json({ success: true, message: "Field deleted." });
    } catch {
      return res
        .status(404)
        .json({ success: false, message: "Field not found." });
    }
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete field." });
  }
}
