const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const CACHE_MS = 10 * 1000;

let cache = { value: false, expires: 0 };

// Called after the admin saves settings so the change applies immediately.
function invalidateMaintenanceCache() {
  cache = { value: false, expires: 0 };
}

async function isMaintenanceOn() {
  const now = Date.now();

  if (cache.expires > now) return cache.value;

  const settings = await prisma.setting.findFirst({
    select: { maintenanceMode: true },
  });

  cache = {
    value: settings?.maintenanceMode === true,
    expires: now + CACHE_MS,
  };

  return cache.value;
}

// The site (and the admin login) must stay reachable while in maintenance.
function isAlwaysAllowed(req) {
  const path = req.originalUrl.split("?")[0].replace(/\/+$/, "");

  if (req.method === "OPTIONS") return true;
  if (path === "/api/health") return true;
  if (path === "/api/settings" && req.method === "GET") return true;
  if (path === "/api/auth/login" && req.method === "POST") return true;

  return false;
}

async function bearerIsActiveAdmin(req) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) return false;

  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true, status: true },
    });

    return !!user && user.role === "ADMIN" && user.status === "ACTIVE";
  } catch {
    return false;
  }
}

// While Setting.maintenanceMode is on, only admins can use the API.
async function maintenanceGuard(req, res, next) {
  try {
    if (isAlwaysAllowed(req)) return next();

    if (!(await isMaintenanceOn())) return next();

    if (await bearerIsActiveAdmin(req)) return next();

    res.setHeader("Retry-After", "300");

    return res.status(503).json({
      success: false,
      maintenance: true,
      message: "The site is under maintenance. Please try again later.",
    });
  } catch (error) {
    // Never take the whole site down because the check itself failed.
    console.error("MAINTENANCE CHECK ERROR:", error.message);
    return next();
  }
}

module.exports = {
  maintenanceGuard,
  invalidateMaintenanceCache,
};
