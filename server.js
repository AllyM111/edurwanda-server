require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ======================================
// Middleware
// ======================================

app.use(
  cors({
    origin: "*",
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
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ======================================
// Request Logger
// ======================================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ======================================
// Root Test
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
// Authentication
// ======================================

app.use(
  "/api/auth",
  require("./routes/auth")
);

// ======================================
// Books
// ======================================

app.use(
  "/api/books",
  require("./routes/books")
);

// ======================================
// Exams
// ======================================

app.use(
  "/api/exams",
  require("./routes/exams")
);

// ======================================
// Users
// ======================================

app.use(
  "/api/users",
  require("./routes/users")
);

// ======================================
// Profile
// ======================================

app.use(
  "/api/profile",
  require("./routes/profile")
);

// ======================================
// Analytics
// ======================================

app.use(
  "/api/analytics",
  require("./routes/analytics")
);

// ======================================
// Settings
// ======================================

app.use(
  "/api/settings",
  require("./routes/settings")
);

// ======================================
// Comments
// ======================================

app.use(
  "/api/comments",
  require("./routes/comments")
);

// ======================================
// YouTube Video CMS 🎥
// ======================================

app.use(
  "/api/youtube",
  require("./routes/youtube")
);

// ======================================
// YouTube Channel CMS 🎬
// ======================================

app.use(
  "/api/youtube-channels",
  require("./routes/youtubeChannels")
);

// ======================================
// PDF Reader API 🚀
// ======================================

app.use(
  "/api/reader",
  require("./routes/reader")
);

// ======================================
// Health Check
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
    console.error(
      "SERVER ERROR:",
      err
    );

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

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      "================================="
    );

    console.log(
      "🚀 EduRwanda Server Running"
    );

    console.log(
      `📡 Port: ${PORT}`
    );

    console.log(
      `🌍 API: http://localhost:${PORT}`
    );

    console.log(
      "💬 Comments: http://localhost:" +
        PORT +
        "/api/comments"
    );

    console.log(
      "================================="
    );
  }
);