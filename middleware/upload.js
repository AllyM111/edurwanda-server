const multer = require("multer");
const config = require("../config/env");

const MAX_BYTES = config.maxUploadMb * 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function reject(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function fileFilter(req, file, cb) {
  if (file.fieldname === "pdf") {
    const looksLikePdf =
      file.mimetype === "application/pdf" &&
      /\.pdf$/i.test(file.originalname || "");

    return looksLikePdf ? cb(null, true) : cb(reject("Only PDF files are allowed."));
  }

  // cover / logo / favicon / images (SVG is deliberately not allowed)
  return IMAGE_TYPES.includes(file.mimetype)
    ? cb(null, true)
    : cb(reject("Only JPG, PNG, WEBP or GIF images are allowed."));
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_BYTES,
    files: 2,
    fields: 30,
  },
  fileFilter,
});

// Defence in depth: the MIME type comes from the client, so also check
// the file's magic bytes.
function hasPdfSignature(file) {
  return (
    !!file &&
    Buffer.isBuffer(file.buffer) &&
    file.buffer.subarray(0, 5).toString("latin1") === "%PDF-"
  );
}

module.exports = {
  upload,
  hasPdfSignature,
};
