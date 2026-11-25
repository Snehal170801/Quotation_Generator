import { Request, Response } from "express";
import prisma from "../config/db.js";

function toApiShape(customer: {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    createdBy: customer.createdById,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

// POST /api/customers — all roles (add customer)
export const createCustomer = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const { name, email, phone, address } = req.body;

    if (!name || !phone || !address) {
      return res
        .status(400)
        .json({ message: "name, phone and address are required." });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        createdById: req.user.id,
      },
    });

    return res.status(201).json({ customer: toApiShape(customer) });
  } catch (error) {
    return res.status(500).json({ message: "Server error creating customer." });
  }
};

// GET /api/customers — all roles (list customers)
export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ customers: customers.map(toApiShape) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error fetching customers." });
  }
};

// GET /api/customers/:id — all roles (single customer)
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    return res.status(200).json({ customer: toApiShape(customer) });
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching customer." });
  }
};

// PUT /api/customers/:id — all roles (update customer)
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, email, phone, address } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    try {
      const customer = await prisma.customer.update({
        where: { id },
        data: updates,
      });
      return res.status(200).json({ customer: toApiShape(customer) });
    } catch {
      return res.status(404).json({ message: "Customer not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error updating customer." });
  }
};

// DELETE /api/customers/:id — admin only (delete customer)
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    try {
      await prisma.customer.delete({ where: { id } });
      return res.status(200).json({ message: "Customer deleted." });
    } catch {
      return res.status(404).json({ message: "Customer not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting customer." });
  }
};
