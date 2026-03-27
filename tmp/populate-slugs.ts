import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[áäâà]/g, 'a')
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log('--- Populating Collection Slugs ---');
  const collections = await prisma.collection.findMany();
  for (const collection of collections) {
    const slug = slugify(collection.name);
    console.log(`Updating Collection: ${collection.name} -> ${slug}`);
    await prisma.collection.update({
      where: { id: collection.id },
      data: { slug },
    });
  }

  console.log('--- Populating Product Slugs ---');
  const products = await prisma.product.findMany();
  for (const product of products) {
    const slug = slugify(product.name);
    console.log(`Updating Product: ${product.name} -> ${slug}`);
    await prisma.product.update({
      where: { id: product.id },
      data: { slug },
    });
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
