const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL,
    },
  },
});

async function fixSequences() {
  console.log("Updating production ID sequences...");

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Book"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Book"), 1),
      true
    )
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Exam"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Exam"), 1),
      true
    )
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"YoutubeChannel"', 'id'),
      COALESCE((SELECT MAX(id) FROM "YoutubeChannel"), 1),
      true
    )
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"YoutubeVideo"', 'id'),
      COALESCE((SELECT MAX(id) FROM "YoutubeVideo"), 1),
      true
    )
  `);

  console.log("Production ID sequences updated successfully.");
}

fixSequences()
  .catch((error) => {
    console.error("Sequence update failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });