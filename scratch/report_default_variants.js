const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const broken = await prisma.productVariant.findMany({
        where: {
            OR: [
                { sku: { contains: 'DEFAULT', mode: 'insensitive' } },
                { attributes: { none: {} } }
            ],
            isActive: true
        },
        include: {
            product: true,
            attributes: true
        }
    });

    const report = broken
        .filter(v => v.sku.toUpperCase().includes('DEFAULT'))
        .map(v => ({
            producto: v.product.name,
            sku: v.sku,
            id_producto: v.product.id
        }));

    console.log(JSON.stringify(report, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
