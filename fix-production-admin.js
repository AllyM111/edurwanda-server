// Repairs the main admin account in the PRODUCTION database
// (fixes a mistyped stored email, restores the ADMIN role and sets a new
// password).
//
// Usage (nothing secret is stored in this file):
//   PROD_DATABASE_URL="postgres://..." \
//   ADMIN_EMAIL="admin@example.com" \
//   ADMIN_NEW_PASSWORD="a-long-unique-password" \
//   node fix-production-admin.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const productionUrl = process.env.PROD_DATABASE_URL;
const targetEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const newPassword = process.env.ADMIN_NEW_PASSWORD || "";

if (!productionUrl) {
  console.error("ERROR: PROD_DATABASE_URL is not set.");
  process.exit(1);
}

if (!targetEmail) {
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

async function fixProductionAdmin() {
  // Find the user even if the stored email has stray characters/case.
  const users = await prisma.user.findMany({
    where: {
      email: { contains: targetEmail, mode: "insensitive" },
    },
  });

  if (users.length === 0) {
    throw new Error(`Could not find a production user matching ${targetEmail}`);
  }

  if (users.length > 1) {
    console.log("Multiple matching users found:");
    console.log(
      JSON.stringify(
        users.map((user) => ({
          id: user.id,
          email: user.email,
          role: user.role,
        })),
        null,
        2
      )
    );

    throw new Error("More than one matching account exists. No changes were made.");
  }

  const user = users[0];

  console.log("User found:");
  console.log("ID:", user.id);
  console.log("Stored email:", user.email);
  console.log("Current role:", user.role);

  const existingCorrectEmail = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (existingCorrectEmail && existingCorrectEmail.id !== user.id) {
    throw new Error(
      `Another production user already uses ${targetEmail}. No changes were made.`
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      email: targetEmail,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("");
  console.log("PRODUCTION ADMIN FIXED SUCCESSFULLY");
  console.log("ID:", updatedUser.id);
  console.log("Email:", updatedUser.email);
  console.log("Role:", updatedUser.role);
  console.log("The new password was NOT printed. Log in and change it.");
}

fixProductionAdmin()
  .catch((error) => {
    console.error("Production admin fix failed:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
