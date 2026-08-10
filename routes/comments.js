
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// ======================================================
// GET ALL COMMENTS
// GET /api/comments
// ======================================================

router.get("/", async (req, res) => {
  try {
    console.log("GET /api/comments");

    const comments = await prisma.comment.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,

        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load comments.",
    });
  }
});

// ======================================================
// CREATE COMMENT
// POST /api/comments
// ======================================================

router.post("/", async (req, res) => {
  try {
    console.log("================================");
    console.log("POST /api/comments");
    console.log("BODY:", req.body);
    console.log("================================");

    const { content } = req.body;

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (
      !content ||
      typeof content !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment is required.",
      });
    }

    const cleanContent = content.trim();

    if (!cleanContent) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }

    if (cleanContent.length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Comment cannot exceed 2000 characters.",
      });
    }

    // ----------------------------------------------
    // CREATE COMMENT
    // ----------------------------------------------

    const comment =
      await prisma.comment.create({
        data: {
          content: cleanContent,
        },

        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          userId: true,

          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

    console.log(
      "COMMENT CREATED:",
      comment.id
    );

    return res.status(201).json({
      success: true,
      message:
        "Comment submitted successfully.",
      data: comment,
    });
  } catch (error) {
    console.error(
      "CREATE COMMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit comment.",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
});

// ======================================================
// DELETE COMMENT
// DELETE /api/comments/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log(
      "DELETE /api/comments/:id",
      id
    );

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID.",
      });
    }

    const existingComment =
      await prisma.comment.findUnique({
        where: {
          id: id,
        },
      });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    await prisma.comment.delete({
      where: {
        id: id,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        "Comment deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE COMMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment.",
    });
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;
