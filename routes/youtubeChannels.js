const express = require("express");

const router = express.Router();

const multer = require("multer");

const prisma = require("../lib/prisma");

const cloudinaryUpload = require("../utils/cloudinaryUpload");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");


// ======================================
// MULTER
// MEMORY STORAGE
// ======================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});


// ======================================
// GET ALL YOUTUBE CHANNELS
// PUBLIC
// ======================================

router.get(
  "/",
  async (req, res) => {
    try {
      const channels =
        await prisma.youtubeChannel.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });

      res.json({
        success: true,
        data: channels,
      });
    } catch (error) {
      console.error(
        "GET YOUTUBE CHANNELS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to load YouTube channels",
      });
    }
  }
);


// ======================================
// GET CHANNEL BY SLUG
// PUBLIC
// ======================================

router.get(
  "/:slug",
  async (req, res) => {
    try {
      const channel =
        await prisma.youtubeChannel.findUnique({
          where: {
            slug: req.params.slug,
          },
        });

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "YouTube channel not found",
        });
      }

      res.json({
        success: true,
        data: channel,
      });
    } catch (error) {
      console.error(
        "GET YOUTUBE CHANNEL ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to load YouTube channel",
      });
    }
  }
);


// ======================================
// CREATE YOUTUBE CHANNEL
// ADMIN ONLY
// ======================================

router.post(
  "/",
  protect,
  adminOnly,

  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    try {
      const {
        slug,
        name,
        description,
        icon,
        youtubeUrl,
        category,
        active,
      } = req.body;


      // ======================================
      // REQUIRED FIELDS
      // ======================================

      if (!slug || !name) {
        return res.status(400).json({
          success: false,
          message: "Slug and channel name are required",
        });
      }


      // ======================================
      // CHECK DUPLICATE SLUG
      // ======================================

      const existingChannel =
        await prisma.youtubeChannel.findUnique({
          where: {
            slug,
          },
        });

      if (existingChannel) {
        return res.status(409).json({
          success: false,
          message:
            "A channel with this slug already exists",
        });
      }


      // ======================================
      // GET UPLOADED FILES
      // ======================================

      const profileFile =
        req.files?.profileImage?.[0];

      const coverFile =
        req.files?.coverImage?.[0];


      // ======================================
      // PROFILE IMAGE
      // ======================================

      let profileImage = null;

      if (profileFile) {
        const result =
          await cloudinaryUpload(
            profileFile.buffer,
            "image",
            profileFile.originalname
          );

        profileImage = result.secure_url;
      }


      // ======================================
      // COVER IMAGE
      // ======================================

      let coverImage = null;

      if (coverFile) {
        const result =
          await cloudinaryUpload(
            coverFile.buffer,
            "image",
            coverFile.originalname
          );

        coverImage = result.secure_url;
      }


      // ======================================
      // CREATE CHANNEL
      // ======================================

      const channel =
        await prisma.youtubeChannel.create({
          data: {
            slug,

            name,

            description:
              description || null,

            icon:
              icon || "🎬",

            profileImage,

            coverImage,

            youtubeUrl:
              youtubeUrl || null,

            category:
              category || "MEDIA",

            active:
              active === undefined
                ? true
                : active === true ||
                  active === "true",
          },
        });


      res.status(201).json({
        success: true,

        message:
          "YouTube channel created successfully",

        data: channel,
      });

    } catch (error) {
      console.error(
        "CREATE YOUTUBE CHANNEL ERROR:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          error.message ||
          "Channel creation failed",
      });
    }
  }
);


// ======================================
// UPDATE YOUTUBE CHANNEL
// ADMIN ONLY
// ======================================

router.put(
  "/:id",
  protect,
  adminOnly,

  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    try {
      const id =
        Number(req.params.id);


      // ======================================
      // VALIDATE ID
      // ======================================

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid channel ID",
        });
      }


      // ======================================
      // FIND CHANNEL
      // ======================================

      const existingChannel =
        await prisma.youtubeChannel.findUnique({
          where: {
            id,
          },
        });

      if (!existingChannel) {
        return res.status(404).json({
          success: false,
          message: "YouTube channel not found",
        });
      }


      const {
        slug,
        name,
        description,
        icon,
        youtubeUrl,
        category,
        active,
      } = req.body;


      // ======================================
      // REQUIRED FIELDS
      // ======================================

      if (!slug || !name) {
        return res.status(400).json({
          success: false,
          message:
            "Slug and channel name are required",
        });
      }


      // ======================================
      // CHECK DUPLICATE SLUG
      // ======================================

      const duplicateChannel =
        await prisma.youtubeChannel.findFirst({
          where: {
            slug,

            NOT: {
              id,
            },
          },
        });

      if (duplicateChannel) {
        return res.status(409).json({
          success: false,
          message:
            "Another channel already uses this slug",
        });
      }


      // ======================================
      // KEEP EXISTING IMAGES
      // ======================================

      let profileImage =
        existingChannel.profileImage;

      let coverImage =
        existingChannel.coverImage;


      // ======================================
      // NEW PROFILE IMAGE
      // ======================================

      const profileFile =
        req.files?.profileImage?.[0];

      if (profileFile) {
        const result =
          await cloudinaryUpload(
            profileFile.buffer,
            "image",
            profileFile.originalname
          );

        profileImage =
          result.secure_url;
      }


      // ======================================
      // NEW COVER IMAGE
      // ======================================

      const coverFile =
        req.files?.coverImage?.[0];

      if (coverFile) {
        const result =
          await cloudinaryUpload(
            coverFile.buffer,
            "image",
            coverFile.originalname
          );

        coverImage =
          result.secure_url;
      }


      // ======================================
      // UPDATE DATA
      // ======================================

      const updateData = {
        slug,

        name,

        description:
          description || null,

        icon:
          icon || "🎬",

        profileImage,

        coverImage,

        youtubeUrl:
          youtubeUrl || null,

        category:
          category || "MEDIA",

        active:
          active === true ||
          active === "true",
      };


      // ======================================
      // UPDATE CHANNEL
      // ======================================

      const channel =
        await prisma.youtubeChannel.update({
          where: {
            id,
          },

          data: updateData,
        });


      res.json({
        success: true,

        message:
          "YouTube channel updated successfully",

        data: channel,
      });

    } catch (error) {
      console.error(
        "UPDATE YOUTUBE CHANNEL ERROR:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          error.message ||
          "Channel update failed",
      });
    }
  }
);


// ======================================
// DELETE YOUTUBE CHANNEL
// ADMIN ONLY
// ======================================

router.delete(
  "/:id",
  protect,
  adminOnly,

  async (req, res) => {
    try {
      const id =
        Number(req.params.id);


      // ======================================
      // VALIDATE ID
      // ======================================

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid channel ID",
        });
      }


      // ======================================
      // CHECK CHANNEL
      // ======================================

      const channel =
        await prisma.youtubeChannel.findUnique({
          where: {
            id,
          },
        });

      if (!channel) {
        return res.status(404).json({
          success: false,
          message:
            "YouTube channel not found",
        });
      }


      // ======================================
      // DELETE CHANNEL
      // ======================================

      await prisma.youtubeChannel.delete({
        where: {
          id,
        },
      });


      res.json({
        success: true,

        message:
          "YouTube channel deleted successfully",
      });

    } catch (error) {
      console.error(
        "DELETE YOUTUBE CHANNEL ERROR:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Channel deletion failed",
      });
    }
  }
);


// ======================================
// MULTER ERROR HANDLER
// ======================================

router.use(
  (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    if (error) {
      console.error(
        "YOUTUBE CHANNEL UPLOAD ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Image upload failed",
      });
    }

    next();
  }
);


module.exports = router;