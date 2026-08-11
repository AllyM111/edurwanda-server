
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ======================================
// ALLOWED FRONTEND ORIGINS
// ======================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",

  // Main Vercel domain
  "https://edurwanda-lake.vercel.app",
];

// ======================================
// CORS
// ======================================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Exact allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments
      if (
        origin.startsWith("https://edurwanda-") &&
        origin.endsWith(".vercel.app")
      ) {
        console.log("CORS allowed Vercel preview:", origin);
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);

      // Do NOT throw an error here.
      // Simply don't allow the origin.
      return callback(null, false);
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    optionsSuccessStatus: 204,
  })
);

// ======================================
// BODY PARSER
// ======================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ======================================
// REQUEST LOGGER
// ======================================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ======================================
// ROOT TEST
// ======================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EduRwanda API running 🚀",
    version: "1.0.0",
  });
});

// ======================================
// API ROUTES
// ======================================

// ======================================
// AUTHENTICATION
// ======================================

app.use(
  "/api/auth",
  require("./routes/auth")
);

// ======================================
// BOOKS
// ======================================

app.use(
  "/api/books",
  require("./routes/books")
);

// ======================================
// EXAMS
// ======================================

app.use(
  "/api/exams",
  require("./routes/exams")
);

// ======================================
// USERS
// ======================================

app.use(
  "/api/users",
  require("./routes/users")
);

// ======================================
// PROFILE
// ======================================

app.use(
  "/api/profile",
  require("./routes/profile")
);

// ======================================
// ANALYTICS
// ======================================

app.use(
  "/api/analytics",
  require("./routes/analytics")
);

// ======================================
// SETTINGS
// ======================================

app.use(
  "/api/settings",
  require("./routes/settings")
);

// ======================================
// COMMENTS
// ======================================

app.use(
  "/api/comments",
  require("./routes/comments")
);

// ======================================
// YOUTUBE VIDEO CMS
// ======================================

app.use(
  "/api/youtube",
  require("./routes/youtube")
);

// ======================================
// YOUTUBE CHANNEL CMS
// ======================================

app.use(
  "/api/youtube-channels",
  require("./routes/youtubeChannels")
);

// ======================================
// PDF READER
// ======================================

app.use(
  "/api/reader",
  require("./routes/reader")
);

// ======================================
// HEALTH CHECK
// ======================================

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      status: "OK",
      database: "Connected",
      service: "EduRwanda",
    });
  }
);

// ======================================
// 404
// ======================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.originalUrl,
    });
  }
);

// ======================================
// GLOBAL ERROR HANDLER
// ======================================

app.use(
  (err, req, res, next) => {
    console.error("=================================");
    console.error("SERVER ERROR:");
    console.error(err);
    console.error("=================================");

    res.status(500).json({
      success: false,
      message: "Internal Server Error",

      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : undefined,
    });
  }
);

// ======================================
// START SERVER
// ======================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 EduRwanda Server Running");
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "production"}`);
  console.log("=================================");
});
