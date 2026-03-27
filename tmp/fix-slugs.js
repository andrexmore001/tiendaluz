const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log("Iniciando actualización de slugs...");

  // 1. Collections
  const collections = await prisma.collection.findMany({
    where: { slug: null }
  });
  console.log(`Encontradas ${collections.length} colecciones sin slug.`);

  for (const col of collections) {
    const slug = slugify(col.name);
    await prisma.collection.update({
      where: { id: col.id },
      data: { slug }
    });
    console.log(`Actualizada colección: ${col.name} -> ${slug}`);
  }

  // 2. Products
  const products = await prisma.product.findMany({
    where: { slug: null }
  });
  console.log(`Encontrados ${products.length} productos sin slug.`);

  for (const p of products) {
    const slug = slugify(p.name);
    await prisma.product.update({
      where: { id: p.id },
      data: { slug }
    });
    console.log(`Actualizado producto: ${p.name} -> ${slug}`);
  }

  console.log("¡Actualización completada!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
