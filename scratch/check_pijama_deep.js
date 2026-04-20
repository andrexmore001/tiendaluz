const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const product = await prisma.product.findFirst({
        where: { name: { contains: 'Pijama', mode: 'insensitive' } },
        include: {
            variants: {
                include: {
                    attributes: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!product) return;

    // Check all variants attribute structure
    product.variants.forEach(v => {
        console.log(`SKU: ${v.sku}`);
        v.attributes.forEach(a => {
            console.log(` - Attr: ${a.attributeValue.attribute.name}, Value: ${a.attributeValue.value}`);
        });
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
