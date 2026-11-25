import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import { parse as parseYaml } from "yaml";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import orderRoutes from "./routes/order.routes.js";
import customerFieldRoutes from "./routes/customerField.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env["PORT"] ?? 5000);
const HOST = "0.0.0.0";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/fields", customerFieldRoutes);
app.use("/api/settings", settingsRoutes);

// Swagger / OpenAPI docs — http://localhost:5000/api-docs
const openapiPath = path.join(__dirname, "docs", "openapi.yaml");
const openapiDocument = parseYaml(fs.readFileSync(openapiPath, "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "🚀 Quatation API is running",
    version: "1.0.0",
    docs: "/api-docs",
  });
});

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌐 Also reachable on your Wi-Fi at http://YOUR_LAN_IP:${PORT}`);
  console.log(`📘 API docs available at http://localhost:${PORT}/api-docs`);
});
