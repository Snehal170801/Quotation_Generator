import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import prisma from "../config/db.js";

const run = async () => {
  try {
    await connectDB();

    const newPassword = "Admin@123";
    const hash = await bcrypt.hash(newPassword, 10);

    try {
      const user = await prisma.user.update({
        where: { email: "admin@quatation.com" },
        data: { password: hash },
      });
      console.log("✅ Password updated for:", user.email);
    } catch {
      console.log("❌ User not found.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

run();
