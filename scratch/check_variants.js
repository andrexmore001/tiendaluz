const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const variantsWithoutAttributes = await prisma.productVariant.findMany({
        where: {
            attributes: {
                none: {}
            }
        },
        include: {
            product: true
        }
    });

    console.log(`Found ${variantsWithoutAttributes.length} variants without attributes.`);
    
    // Group by product to see which products are affected
    const affectedProducts = {};
    variantsWithoutAttributes.forEach(v => {
        if (!affectedProducts[v.productId]) {
            affectedProducts[v.productId] = {
                name: v.product.name,
                variants: []
            };
        }
        affectedProducts[v.productId].variants.push({
            id: v.id,
            sku: v.sku,
            price: v.price
        });
    });

    console.log('Affected Products:', JSON.stringify(affectedProducts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
