// Loads .env and validates required settings (exits early if they are missing).
const config = require("./config/env");

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const prisma = require("./lib/prisma");
const {
  securityHeaders,
  createRateLimiter,
  purgeExpiredRateLimits,
} = require("./middleware/security");
const { maintenanceGuard } = require("./middleware/maintenance");

const app = express();

// Render / Railway / Vercel sit behind a proxy. Without this every visitor
// shares one IP and rate limiting would block everybody together.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(securityHeaders);

// ======================================
// CORS
// ======================================
const vercelPreview = /^https:\/\/edurwanda-[a-z0-9-]+\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser clients (curl, server-to-server) send no Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (config.allowVercelPreviews && vercelPreview.test(origin)) {
        return callback(null, true);
      }

      console.warn("CORS blocked:", origin);

      // Not an error: the browser simply gets no CORS headers.
      return callback(null, false);
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

// ======================================
// GENERAL RATE LIMIT
// ======================================
app.use(
  "/api",
  createRateLimiter({
    windowMs: 60 * 1000,
    max: 300,
    message: "Too many requests. Please slow down.",
  })
);

// ======================================
// MAINTENANCE MODE
// (admins and the login/settings/health routes stay available)
// ======================================
app.use("/api", maintenanceGuard);

// ======================================
// BODY PARSERS
// ======================================
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// ======================================
// REQUEST LOGGER (method + path only; never query strings or bodies)
// ======================================
if (!config.isProduction) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ======================================
// ROUTES
// ======================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EduRwanda API running",
    version: "1.0.0",
  });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", require("./routes/books"));
app.use("/api/exams", require("./routes/exams"));
app.use("/api/users", require("./routes/users"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/youtube", require("./routes/youtube"));
app.use("/api/youtube-channels", require("./routes/youtubeChannels"));
app.use("/api/reader", require("./routes/reader"));

// ======================================
// HEALTH CHECK (really checks the database)
// ======================================
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      status: "OK",
      database: "Connected",
      service: "EduRwanda",
    });
  } catch (error) {
    console.error("HEALTH CHECK FAILED:", error.message);

    res.status(503).json({
      success: false,
      status: "DEGRADED",
      database: "Unavailable",
      service: "EduRwanda",
    });
  }
});

// ======================================
// 404
// ======================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ======================================
// GLOBAL ERROR HANDLER
// ======================================
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Upload problems (file too big, too many files, ...)
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === "LIMIT_FILE_SIZE";

    return res.status(tooBig ? 413 : 400).json({
      success: false,
      message: tooBig
        ? `File is too large (max ${config.maxUploadMb} MB)`
        : "Invalid upload",
    });
  }

  // Malformed JSON and other request errors raised by body-parser
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body too large",
    });
  }

  // Deliberate client errors (e.g. rejected file type)
  if (err.status === 400) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: config.isProduction ? undefined : err.message,
  });
});

// ======================================
// SAFETY NETS
// ======================================
// Clean expired rate-limit counters every 15 minutes
const purgeTimer = setInterval(() => {
  purgeExpiredRateLimits().catch((error) =>
    console.error("RATE LIMIT PURGE ERROR:", error.message)
  );
}, 15 * 60 * 1000);

purgeTimer.unref();

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

// ======================================
// START SERVER
// ======================================
const server = app.listen(config.port, () => {
  console.log("=================================");
  console.log("EduRwanda Server Running");
  console.log(`Port: ${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=================================");
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  // Don't hang forever on open connections.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
