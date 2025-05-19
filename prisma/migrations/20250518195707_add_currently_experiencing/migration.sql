-- CreateTable
CREATE TABLE "CurrentlyExperiencing" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT,
    "progress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrentlyExperiencing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CurrentlyExperiencing_userId_idx" ON "CurrentlyExperiencing"("userId");

-- AddForeignKey
ALTER TABLE "CurrentlyExperiencing" ADD CONSTRAINT "CurrentlyExperiencing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
