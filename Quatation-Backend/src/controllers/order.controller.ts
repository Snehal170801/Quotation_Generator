import { Request, Response } from "express";
import prisma from "../config/db.js";
import { OrderStatus, Prisma } from "../generated/prisma/client.js";

function toApiShape(order: {
  id: string;
  quotationNumber: string;
  customerDetails: unknown;
  lineItems: unknown;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  status: string;
  createdById: string;
  createdBy?: { id: string; name: string; email: string; role: string };
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: order.id,
    quotationNumber: order.quotationNumber,
    customerDetails: order.customerDetails,
    lineItems: order.lineItems,
    subtotal: order.subtotal,
    discountPercent: order.discountPercent,
    discountAmount: order.discountAmount,
    gstRate: order.gstRate,
    gstAmount: order.gstAmount,
    total: order.total,
    status: order.status,
    createdBy: order.createdBy
      ? {
          _id: order.createdBy.id,
          name: order.createdBy.name,
          email: order.createdBy.email,
          role: order.createdBy.role,
        }
      : order.createdById,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated." });

    const {
      quotationNumber,
      customerDetails,
      lineItems,
      subtotal,
      discountPercent,
      discountAmount,
      gstRate,
      gstAmount,
      total,
      status,
    } = req.body;

    if (!quotationNumber)
      return res.status(400).json({ message: "quotationNumber is required." });
    if (!Array.isArray(lineItems) || lineItems.length === 0)
      return res
        .status(400)
        .json({ message: "At least one line item is required." });

    const order = await prisma.order.create({
      data: {
        quotationNumber,
        customerDetails: customerDetails ?? [],
        lineItems,
        subtotal: subtotal ?? 0,
        discountPercent: discountPercent ?? 0,
        discountAmount: discountAmount ?? 0,
        gstRate: gstRate ?? 18,
        gstAmount: gstAmount ?? 0,
        total: total ?? 0,
        status: (status ?? "draft") as OrderStatus,
        createdById: req.user.id,
      },
    });

    return res.status(201).json({ success: true, order: toApiShape(order) });
  } catch (error: unknown) {
    const isDuplicate =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002";
    const msg = isDuplicate
      ? "Quotation number already exists."
      : "Server error creating order.";
    return res.status(500).json({ message: msg });
  }
};

// GET /api/orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const where: Prisma.OrderWhereInput = {};

    if (req.user?.role === "sales") where.createdById = req.user.id;
    if (status) where.status = status as OrderStatus;

    if (search) {
      where.quotationNumber = { contains: String(search), mode: "insensitive" };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return res
      .status(200)
      .json({ success: true, orders: orders.map(toApiShape) });
  } catch {
    return res.status(500).json({ message: "Server error fetching orders." });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params["id"] as string },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (req.user?.role === "sales" && order.createdById !== req.user.id)
      return res.status(403).json({ message: "Access denied." });
    return res.status(200).json({ success: true, order: toApiShape(order) });
  } catch {
    return res.status(500).json({ message: "Server error fetching order." });
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["draft", "saved"].includes(status))
      return res
        .status(400)
        .json({ message: "status must be 'draft' or 'saved'." });

    const existing = await prisma.order.findUnique({
      where: { id: req.params["id"] as string },
    });
    if (!existing) return res.status(404).json({ message: "Order not found." });
    if (req.user?.role === "sales" && existing.createdById !== req.user.id)
      return res.status(403).json({ message: "Access denied." });

    const order = await prisma.order.update({
      where: { id: existing.id },
      data: { status: status as OrderStatus },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return res.status(200).json({ success: true, order: toApiShape(order) });
  } catch {
    return res
      .status(500)
      .json({ message: "Server error updating order status." });
  }
};

// DELETE /api/orders/:id — admin only
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    try {
      await prisma.order.delete({ where: { id: req.params["id"] as string } });
      return res.status(200).json({ success: true, message: "Order deleted." });
    } catch {
      return res.status(404).json({ message: "Order not found." });
    }
  } catch {
    return res.status(500).json({ message: "Server error deleting order." });
  }
};
