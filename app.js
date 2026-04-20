import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import categoryRoutes from "./routes/categories.route.js";
import productRoutes from "./routes/products.route.js";
import adminAuthRoutes from "./routes/adminAuth.route.js";
import userAuthRoutes from "./routes/user.route.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import "./config/dotenv.js";
import "./config/mongo.js";

const app = express();

const allowedOrigins = [
  "https://the-fabric-people.vercel.app",
  "https://tfp-backend.onrender.com",
  "http://localhost:3000",
  ...(process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser())

app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/user", userAuthRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log("Server stared on", process.env.PORT);
});

export default app;
