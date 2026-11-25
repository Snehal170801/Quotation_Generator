import { type Request, type Response } from "express";
import prisma from "../config/db.js";
// Ensure the singleton row exists and return it
async function getOrCreate() {
  let doc = await prisma.settings.findFirst();
  if (!doc) doc = await prisma.settings.create({ data: {} });
  return doc;
}

function toNestedShape(doc: Awaited<ReturnType<typeof getOrCreate>>) {
  return {
    _id: doc.id,
    company: {
      name: doc.companyName,
      tagline: doc.companyTagline,
      address: doc.companyAddress,
      phone: doc.companyPhone,
      email: doc.companyEmail,
      gst: doc.companyGst,
    },
    quotation: {
      gstRate: doc.gstRate,
      validityDays: doc.validityDays,
      prefix: doc.prefix,
      defaultDiscountPercent: doc.defaultDiscountPercent,
    },
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// GET /api/settings — all authenticated roles
export async function getSettings(_req: Request, res: Response) {
  try {
    const doc = await getOrCreate();
    res.json({ success: true, data: toNestedShape(doc) });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch settings." });
  }
}

// PUT /api/settings — admin only
export async function updateSettings(req: Request, res: Response) {
  try {
    const { company, quotation } = req.body;
    const doc = await getOrCreate();

    const updates: Record<string, unknown> = {};

    if (company) {
      if (company.name !== undefined) updates.companyName = company.name.trim();
      if (company.tagline !== undefined)
        updates.companyTagline = company.tagline.trim();
      if (company.address !== undefined)
        updates.companyAddress = company.address.trim();
      if (company.phone !== undefined)
        updates.companyPhone = company.phone.trim();
      if (company.email !== undefined)
        updates.companyEmail = company.email.trim();
      if (company.gst !== undefined) updates.companyGst = company.gst.trim();
    }

    if (quotation) {
      if (quotation.gstRate !== undefined) {
        const rate = Number(quotation.gstRate);
        if (isNaN(rate) || rate < 0 || rate > 100)
          return res
            .status(400)
            .json({ success: false, message: "gstRate must be 0–100." });
        updates.gstRate = rate;
      }
      if (quotation.validityDays !== undefined) {
        const days = Number(quotation.validityDays);
        if (isNaN(days) || days < 1)
          return res
            .status(400)
            .json({ success: false, message: "validityDays must be ≥ 1." });
        updates.validityDays = days;
      }
      if (quotation.prefix !== undefined)
        updates.prefix = quotation.prefix.trim();
      if (quotation.defaultDiscountPercent !== undefined) {
        const pct = Number(quotation.defaultDiscountPercent);
        if (isNaN(pct) || pct < 0 || pct > 100)
          return res
            .status(400)
            .json({
              success: false,
              message: "defaultDiscountPercent must be 0–100.",
            });
        updates.defaultDiscountPercent = pct;
      }
    }

    const updated = await prisma.settings.update({
      where: { id: doc.id },
      data: updates,
    });

    res.json({ success: true, data: toNestedShape(updated) });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to update settings." });
  }
}
