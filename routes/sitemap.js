
const express = require("express");

const router = express.Router();

const SITE_URL = "https://edurwanda-lake.vercel.app";

const publicPages = [
  "/",
  "/books",
  "/exams",
  "/youtube",
  "/about",
];

router.get("/", (req, res) => {
  const urls = publicPages
    .map(
      (page) => `
  <url>
    <loc>${SITE_URL}${page}</loc>
  </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res
    .status(200)
    .set("Content-Type", "application/xml; charset=utf-8")
    .set("Cache-Control", "public, max-age=3600")
    .send(sitemap);
});

module.exports = router;
