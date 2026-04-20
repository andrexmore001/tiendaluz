const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const broken = await prisma.productVariant.findMany({
        where: {
            attributes: { none: {} },
            isActive: true
        },
        include: {
            product: true
        }
    });

    const report = broken.map(v => {
        const isDefault = v.sku.toUpperCase().includes('DEFAULT');
        return {
            producto: v.product.name,
            sku: v.sku,
            id_producto: v.product.id,
            tipo: isDefault ? 'DEFAULT (Manual)' : 'CON MEDIDAS (Auto-reparable)'
        };
    });

    console.log(JSON.stringify(report, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
