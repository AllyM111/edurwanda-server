const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL,
    },
  },
});

async function fixProductionAdmin() {
  const targetEmail = "allymutabazi11@gmail.com";
  const newPassword = "Jesus2@28";

  console.log("");
  console.log("Connecting to Railway PostgreSQL...");

  // Find the user by searching inside the stored email.
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: "allymutabazi11@gmail.com",
        mode: "insensitive",
      },
    },
  });

  if (users.length === 0) {
    throw new Error(
      "Could not find a production user containing allymutabazi11@gmail.com"
    );
  }

  if (users.length > 1) {
    console.log("");
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

    throw new Error(
      "More than one matching account exists. No changes were made."
    );
  }

  const user = users[0];

  console.log("");
  console.log("User found:");
  console.log("ID:", user.id);
  console.log("Stored email:", user.email);
  console.log("Current role:", user.role);

  // Check whether the correct email is already used by another account.
  const existingCorrectEmail = await prisma.user.findUnique({
    where: {
      email: targetEmail,
    },
  });

  if (
    existingCorrectEmail &&
    existingCorrectEmail.id !== user.id
  ) {
    throw new Error(
      `Another production user already uses ${targetEmail}. No changes were made.`
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      email: targetEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("");
  console.log("======================================");
  console.log("PRODUCTION ADMIN FIXED SUCCESSFULLY");
  console.log("======================================");
  console.log("ID:", updatedUser.id);
  console.log("Email:", updatedUser.email);
  console.log("Role:", updatedUser.role);
  console.log("");
  console.log("Temporary password: Jesus2@28");
  console.log("");
  console.log("The account is now ready for login.");
}

fixProductionAdmin()
  .catch((error) => {
    console.error("");
    console.error("Production admin fix failed:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });