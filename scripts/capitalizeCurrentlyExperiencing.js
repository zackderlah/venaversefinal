const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/([\wÀ-ÿ][^\s-]*)/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
}

async function main() {
  const items = await prisma.currentlyExperiencing.findMany();
  for (const item of items) {
    await prisma.currentlyExperiencing.update({
      where: { id: item.id },
      data: {
        title: toTitleCase(item.title),
        creator: toTitleCase(item.creator),
      },
    });
  }
  console.log('All currently experiencing items capitalized!');
}

main().finally(() => prisma.$disconnect()); 