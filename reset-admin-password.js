const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL,
    },
  },
});

async function resetAdminPassword() {
  const email = "allymutabazi11@gmail.com";

  // Temporary password — change this after logging in.
  const newPassword = "Jesus2@28";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  console.log("");
  console.log("Found user:");
  console.log("Email:", user.email);
  console.log("Role:", user.role);

  if (user.role !== "ADMIN") {
    throw new Error(
      `This account is not ADMIN. Current role: ${user.role}`
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  });

  console.log("");
  console.log("=================================");
  console.log("ADMIN PASSWORD RESET SUCCESSFULLY");
  console.log("=================================");
  console.log("Email:", email);
  console.log("Role:", user.role);
  console.log("Temporary password: Jesus2@28");
  console.log("");
  console.log("Please change this password after logging in.");
}

resetAdminPassword()
  .catch((error) => {
    console.error("");
    console.error("Password reset failed:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });