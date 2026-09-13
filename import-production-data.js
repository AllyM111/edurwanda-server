const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const productionUrl = process.env.PROD_DATABASE_URL;

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

function reviveDates(record) {
  const result = { ...record };

  for (const key of ["createdAt", "updatedAt"]) {
    if (result[key]) {
      result[key] = new Date(result[key]);
    }
  }

  return result;
}

async function importRecords(modelName, records) {
  const model = prisma[modelName];

  if (!model) {
    throw new Error(`Prisma model "${modelName}" was not found.`);
  }

  let count = 0;

  for (const record of records) {
    const data = reviveDates(record);

    await model.upsert({
      where: {
        id: data.id,
      },
      update: data,
      create: data,
    });

    count++;
  }

  return count;
}

async function main() {
  console.log("Connecting to Railway PostgreSQL...");
  await prisma.$connect();

  console.log("Connected successfully.\n");

  const file = "edurwanda-content.json";

  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}`);
  }

  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  console.log("Importing EduRwanda content...\n");

  const books = await importRecords("book", data.books);
  console.log(`Books imported: ${books}`);

  const exams = await importRecords("exam", data.exams);
  console.log(`Exams imported: ${exams}`);

  const settings = await importRecords("setting", data.settings);
  console.log(`Settings imported: ${settings}`);

  const channels = await importRecords(
    "youtubeChannel",
    data.youtubeChannels
  );
  console.log(`YouTube channels imported: ${channels}`);

  const videos = await importRecords(
    "youtubeVideo",
    data.youtubeVideos
  );
  console.log(`YouTube videos imported: ${videos}`);

  console.log("\n=================================");
  console.log("IMPORT COMPLETED SUCCESSFULLY");
  console.log("=================================");
  console.log("Existing Railway users were NOT imported.");
  console.log("Your production admin remains untouched.");
}

main()
  .catch((error) => {
    console.error("\nIMPORT FAILED:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });