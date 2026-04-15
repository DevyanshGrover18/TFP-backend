import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import "./config/dotenv.js";
import "./config/mongo.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser())

app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log("Server stared on", process.env.PORT);
});

export default app;
