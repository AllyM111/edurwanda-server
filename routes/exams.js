
const express = require("express");
const router = express.Router();

const prisma = require("../lib/prisma");
const multer = require("multer");
const axios = require("axios");

const cloudinaryUpload =
  require("../utils/cloudinaryUpload");

// ======================================
// MULTER
// ======================================

const upload = multer({
  storage: multer.memoryStorage(),
});

// ======================================
// GET ALL EXAMS
// ======================================

router.get("/", async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(exams);
  } catch (error) {
    console.log("GET EXAMS ERROR:", error);

    res.status(500).json({
      message: "Failed loading exams",
      error: error.message,
    });
  }
});

// ======================================
// DOWNLOAD EXAM PDF
// IMPORTANT:
// MUST BE BEFORE /:id
// ======================================

router.get("/download/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid exam ID",
      });
    }

    const exam = await prisma.exam.findUnique({
      where: {
        id,
      },
    });

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    if (!exam.fileUrl) {
      return res.status(404).json({
        message: "PDF file unavailable",
      });
    }

    const response = await axios({
      method: "GET",
      url: exam.fileUrl,
      responseType: "stream",
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${exam.title}.pdf"`
    );

    // ==================================
    // UPDATE DOWNLOAD COUNT
    // ==================================

    try {
      await prisma.exam.update({
        where: {
          id,
        },
        data: {
          downloads: {
            increment: 1,
          },
        },
      });
    } catch (countError) {
      console.log(
        "EXAM DOWNLOAD COUNT ERROR:",
        countError.message
      );
    }

    response.data.pipe(res);
  } catch (error) {
    console.log(
      "EXAM DOWNLOAD ERROR:",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        message: "Download failed",
        error: error.message,
      });
    }
  }
});

// ======================================
// GET SINGLE EXAM
// ======================================

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid exam ID",
      });
    }

    const exam = await prisma.exam.findUnique({
      where: {
        id,
      },
    });

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.json(exam);
  } catch (error) {
    console.log(
      "GET EXAM ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed loading exam",
      error: error.message,
    });
  }
});

// ======================================
// CREATE EXAM
// PDF ONLY
// ======================================

router.post(
  "/",
  upload.single("pdf"),

  async (req, res) => {
    console.log(
      "======================================"
    );

    console.log(
      "CREATE EXAM REQUEST RECEIVED"
    );

    console.log(
      "BODY:",
      req.body
    );

    console.log(
      "PDF:",
      req.file
        ? req.file.originalname
        : "NO PDF"
    );

    try {
      const {
        type,
        title,
        category,
        level,
        subject,
        year,
      } = req.body;

      // ==================================
      // VALIDATE TITLE
      // ==================================

      if (!title) {
        return res.status(400).json({
          message: "Title is required",
        });
      }

      // ==================================
      // VALIDATE PDF
      // ==================================

      if (!req.file) {
        console.log(
          "CREATE EXAM ERROR: PDF missing"
        );

        return res.status(400).json({
          message: "PDF file required",
        });
      }

      const pdfFile = req.file;

      console.log(
        "EXAM PDF:",
        pdfFile.originalname
      );

      console.log(
        "EXAM PDF SIZE:",
        pdfFile.size
      );

      // ==================================
      // UPLOAD PDF TO CLOUDINARY
      // ==================================

      const pdfUpload =
        await cloudinaryUpload(
          pdfFile.buffer,
          "raw",
          pdfFile.originalname
        );

      console.log(
        "PDF UPLOAD SUCCESS"
      );

      // ==================================
      // CREATE DATABASE RECORD
      // ==================================

      console.log(
        "CREATING EXAM IN DATABASE..."
      );

      const exam =
        await prisma.exam.create({
          data: {
            title,

            // IMPORTANT:
            // category is required by Prisma
            category:
              category ||
              "PAST_EXAM",

            type:
              type ||
              "PAST_EXAM",

            level:
              level ||
              null,

            subject:
              subject ||
              null,

            year:
              year
                ? Number(year)
                : null,

            fileUrl:
              pdfUpload.secure_url,

            // No cover
            coverUrl: null,
          },
        });

      console.log(
        "EXAM CREATED:",
        exam.id
      );

      return res.status(201).json({
        success: true,
        data: exam,
      });
    } catch (error) {
      console.log(
        "======================================"
      );

      console.log(
        "CREATE EXAM ERROR:"
      );

      console.log(error);

      console.log(
        "ERROR MESSAGE:",
        error.message
      );

      console.log(
        "ERROR NAME:",
        error.name
      );

      console.log(
        "======================================"
      );

      return res.status(500).json({
        success: false,
        message: "Exam creation failed",
        error: error.message,
      });
    }
  }
);

// ======================================
// UPDATE EXAM
// PDF ONLY
// ======================================

router.put(
  "/:id",
  upload.single("pdf"),

  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid exam ID",
        });
      }

      const oldExam =
        await prisma.exam.findUnique({
          where: {
            id,
          },
        });

      if (!oldExam) {
        return res.status(404).json({
          message: "Exam not found",
        });
      }

      // ==================================
      // KEEP OLD PDF
      // ==================================

      let fileUrl =
        oldExam.fileUrl;

      // ==================================
      // NEW PDF
      // ==================================

      if (req.file) {
        const pdfUpload =
          await cloudinaryUpload(
            req.file.buffer,
            "raw",
            req.file.originalname
          );

        fileUrl =
          pdfUpload.secure_url;
      }

      // ==================================
      // UPDATE EXAM
      // ==================================

      const exam =
        await prisma.exam.update({
          where: {
            id,
          },

          data: {
            title:
              req.body.title ||
              oldExam.title,

            category:
              req.body.category ||
              oldExam.category ||
              "PAST_EXAM",

            type:
              req.body.type ||
              oldExam.type ||
              "PAST_EXAM",

            level:
              req.body.level ||
              oldExam.level,

            subject:
              req.body.subject ||
              oldExam.subject,

            year:
              req.body.year
                ? Number(req.body.year)
                : oldExam.year,

            fileUrl,
          },
        });

      res.json({
        success: true,
        data: exam,
      });
    } catch (error) {
      console.log(
        "UPDATE EXAM ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Update failed",
        error: error.message,
      });
    }
  }
);

// ======================================
// DELETE EXAM
// ======================================

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message:
            "Invalid exam ID",
        });
      }

      await prisma.exam.delete({
        where: {
          id,
        },
      });

      res.json({
        success: true,
        message:
          "Exam deleted",
      });
    } catch (error) {
      console.log(
        "DELETE EXAM ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Delete failed",
        error:
          error.message,
      });
    }
  }
);

module.exports = router;