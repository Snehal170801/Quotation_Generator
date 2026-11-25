import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import prisma from "../config/db.js";

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@quatation.com";
    const password = "Admin@123";

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      console.log("⚠️  Admin already exists:", email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },
    });

    console.log("✅ Admin created successfully:");
    console.log("   email:   ", admin.email);
    console.log("   password:", password);
    console.log(
      "   (login with these, then create real admin/sales users via /api/users)",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
