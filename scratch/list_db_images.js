const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
    const imagesInDb = new Set();

    // 1. Products
    const products = await prisma.product.findMany();
    products.forEach(p => {
        if (p.image) imagesInDb.add(p.image);
        if (p.images) {
            try {
                const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                if (Array.isArray(images)) {
                    images.forEach(img => {
                        if (typeof img === 'string') imagesInDb.add(img);
                        else if (img.url) imagesInDb.add(img.url);
                    });
                }
            } catch (e) {}
        }
    });

    // 2. Variants
    const variants = await prisma.productVariant.findMany();
    variants.forEach(v => {
        if (v.image) imagesInDb.add(v.image);
    });

    // 3. Settings
    const settings = await prisma.setting.findFirst();
    if (settings) {
        if (settings.logo) imagesInDb.add(settings.logo);
        if (settings.nequiQr) imagesInDb.add(settings.nequiQr);
        if (settings.heroImages) {
             try {
                const images = typeof settings.heroImages === 'string' ? JSON.parse(settings.heroImages) : settings.heroImages;
                if (Array.isArray(images)) images.forEach(img => imagesInDb.add(img));
            } catch (e) {}
        }
        if (settings.reviews) {
            try {
                const reviews = typeof settings.reviews === 'string' ? JSON.parse(settings.reviews) : settings.reviews;
                if (Array.isArray(reviews)) {
                    reviews.forEach(r => {
                        if (typeof r === 'string') imagesInDb.add(r);
                        else if (r.url) imagesInDb.add(r.url);
                    });
                }
            } catch (e) {}
        }
    }

    // 4. Materials
    const materials = await prisma.material.findMany();
    materials.forEach(m => {
        if (m.textureUrl) imagesInDb.add(m.textureUrl);
    });

    fs.writeFileSync('scratch/db_images.json', JSON.stringify(Array.from(imagesInDb), null, 2), 'utf8');
    console.log(`Saved ${imagesInDb.size} unique image URLs to scratch/db_images.json`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
