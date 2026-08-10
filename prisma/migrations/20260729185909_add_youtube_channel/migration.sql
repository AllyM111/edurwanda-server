-- CreateTable
CREATE TABLE "YoutubeChannel" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "profileImage" TEXT,
    "coverImage" TEXT,
    "youtubeUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'MEDIA',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YoutubeChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeChannel_slug_key" ON "YoutubeChannel"("slug");
