
const express = require("express");
const router = express.Router();

const prisma = require("../lib/prisma");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ======================================
// GET SETTINGS
// Public — frontend needs these settings
// ======================================
router.get("/", async (req, res) => {
  try {
    let settings = await prisma.setting.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          siteName: "EduRwanda",
          siteDescription: "Rwanda National Education Platform",
          theme: "dark",
          primaryColor: "blue",
          language: "English",
          allowRegistration: true,
          allowBookDownloads: true,
          allowExamDownloads: true,
          maintenanceMode: false,
          maxUploadSize: 20,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load settings",
    });
  }
});

// ======================================
// UPDATE SETTINGS
// Admin only
// ======================================
router.put("/", protect, adminOnly, async (req, res) => {
  try {
    let settings = await prisma.setting.findFirst();

    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          siteName: "EduRwanda",
          siteDescription: "Rwanda National Education Platform",
          theme: "dark",
          primaryColor: "blue",
          language: "English",
          allowRegistration: true,
          allowBookDownloads: true,
          allowExamDownloads: true,
          maintenanceMode: false,
          maxUploadSize: 20,
        },
      });
    }

    const updatedSettings = await prisma.setting.update({
      where: {
        id: settings.id,
      },
      data: {
        siteName: req.body.siteName,
        siteDescription: req.body.siteDescription,
        siteEmail: req.body.siteEmail,
        sitePhone: req.body.sitePhone,
        siteAddress: req.body.siteAddress,

        theme: req.body.theme,
        primaryColor: req.body.primaryColor,
        language: req.body.language,

        logoUrl: req.body.logoUrl,
        faviconUrl: req.body.faviconUrl,

        allowRegistration: req.body.allowRegistration,
        allowBookDownloads: req.body.allowBookDownloads,
        allowExamDownloads: req.body.allowExamDownloads,

        maintenanceMode: req.body.maintenanceMode,

        maxUploadSize: req.body.maxUploadSize,
      },
    });

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
});

module.exports = router;
