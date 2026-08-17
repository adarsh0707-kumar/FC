import dns from "dns";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import playersRoutes from "./routes/players.routes.js";
import fixturesRoutes from "./routes/fixtures.routes.js";
import resultsRoutes from "./routes/results.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

// Node 17+ returns DNS results in resolver order, which puts AAAA first for hosted
// Postgres providers like Neon. On a network without working IPv6 egress that means
// every connection attempt fails with an opaque "can't reach database server".
// Preferring A records costs nothing where IPv6 does work.
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT || 4000;

// Render/Railway terminate TLS at a proxy, so req.ip is the proxy's address unless
// Express is told to trust the X-Forwarded-For header. Rate limiting keys on req.ip,
// so without this every client shares one bucket.
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/players", playersRoutes);
app.use("/api/fixtures", fixturesRoutes);
app.use("/api/results", resultsRoutes);

// 404 for unmatched API routes
app.use("/api", (req, res) =>
  res.status(404).json({ error: "Route not found" }),
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Football Club API running on http://localhost:${PORT}`);
});
