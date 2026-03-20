import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { slug: 'tazas', label: 'Tazas', order: 1 },
    { slug: 'platos', label: 'Platos', order: 2 },
    { slug: 'bowls', label: 'Bowls', order: 3 },
    { slug: 'jarrones', label: 'Jarrones', order: 4 },
    { slug: 'decoracion', label: 'Decoración', order: 5 },
    { slug: 'set_vajilla', label: 'Set Vajilla', order: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Categories seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
