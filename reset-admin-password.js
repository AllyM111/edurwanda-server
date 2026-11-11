// Resets an ADMIN account's password in the PRODUCTION database.
//
// Usage (nothing secret is stored in this file):
//   PROD_DATABASE_URL="postgres://..." \
//   ADMIN_EMAIL="admin@example.com" \
//   ADMIN_NEW_PASSWORD="a-long-unique-password" \
//   node reset-admin-password.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const productionUrl = process.env.PROD_DATABASE_URL;
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const newPassword = process.env.ADMIN_NEW_PASSWORD || "";

if (!productionUrl) {
  console.error("ERROR: PROD_DATABASE_URL is not set.");
  process.exit(1);
}

if (!email) {
  console.error("ERROR: ADMIN_EMAIL is not set.");
  process.exit(1);
}

if (newPassword.length < 12) {
  console.error("ERROR: ADMIN_NEW_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: productionUrl } },
});

async function resetAdminPassword() {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  if (user.role !== "ADMIN") {
    throw new Error(
      `This account is not ADMIN. Current role: ${user.role}`
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, status: "ACTIVE" },
  });

  console.log("");
  console.log("ADMIN PASSWORD RESET SUCCESSFULLY");
  console.log("Email:", email);
  console.log("The new password was NOT printed. Log in and change it.");
}

resetAdminPassword()
  .catch((error) => {
    console.error("Password reset failed:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
