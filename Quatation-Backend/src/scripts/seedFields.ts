import "dotenv/config";
import { connectDB } from "../config/db.js";
import prisma from "../config/db.js";
import { FieldType } from "../generated/prisma/client.js";

const DEFAULT_FIELDS: {
  name: string;
  type: FieldType;
  required: boolean;
  order: number;
}[] = [
  { name: "Customer Name", type: "text", required: true, order: 0 },
  { name: "Email Address", type: "email", required: true, order: 1 },
  { name: "Phone Number", type: "phone", required: true, order: 2 },
  { name: "Company Name", type: "text", required: false, order: 3 },
  { name: "Billing Address", type: "address", required: true, order: 4 },
  { name: "GST Number", type: "text", required: false, order: 5 },
];

async function seed() {
  await connectDB();

  const count = await prisma.customerField.count();
  if (count > 0) {
    console.log(
      `CustomerField table already has ${count} rows — skipping seed.`,
    );
    process.exit(0);
  }

  await prisma.customerField.createMany({ data: DEFAULT_FIELDS });
  console.log(`✅ Seeded ${DEFAULT_FIELDS.length} default customer fields.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
