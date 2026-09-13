const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function main() {
  console.log("Reading local EduRwanda database...");

  const data = {
    books: await prisma.book.findMany(),
    exams: await prisma.exam.findMany(),
    settings: await prisma.setting.findMany(),
    youtubeChannels: await prisma.youtubeChannel.findMany(),
    youtubeVideos: await prisma.youtubeVideo.findMany(),
  };

  const output = "edurwanda-content.json";

  fs.writeFileSync(output, JSON.stringify(data, null, 2));

  console.log("\nExport completed successfully.");
  console.log(`File: ${output}`);
  console.log(`Books: ${data.books.length}`);
  console.log(`Exams: ${data.exams.length}`);
  console.log(`Settings: ${data.settings.length}`);
  console.log(`YouTube channels: ${data.youtubeChannels.length}`);
  console.log(`YouTube videos: ${data.youtubeVideos.length}`);
}

main()
  .catch((error) => {
    console.error("\nExport failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });