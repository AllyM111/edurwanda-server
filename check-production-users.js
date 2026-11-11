const { PrismaClient } = require("@prisma/client");

const productionUrl = process.env.PROD_DATABASE_URL;

// Never fall back to the default database by accident.
if (!productionUrl) {
  console.error("ERROR: PROD_DATABASE_URL is not set.");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: productionUrl,
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