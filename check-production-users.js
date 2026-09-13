const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL,
    },
  },
});

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log("");
  console.log("PRODUCTION USERS");
  console.log("================");

  console.log(JSON.stringify(users, null, 2));
}

checkUsers()
  .catch((error) => {
    console.error("Failed to read production users:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });