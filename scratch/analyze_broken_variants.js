const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const brokenVariants = await prisma.productVariant.findMany({
        where: {
            attributes: {
                none: {}
            },
            isActive: true
        },
        include: {
            product: true
        }
    });

    console.log(`Encontradas ${brokenVariants.length} variantes sin atributos.`);
    
    // Agrupar por producto para ver el impacto
    const impact = brokenVariants.reduce((acc, v) => {
        const key = v.product.name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(v.sku);
        return acc;
    }, {});

    console.log("Impacto por producto:");
    console.log(JSON.stringify(impact, null, 2));

    // Ver atributos globales disponibles para ver si podemos mapear algo
    const globalAttributes = await prisma.attribute.findMany({
        include: { values: true }
    });

    console.log("\nAtributos globales disponibles para mapeo:");
    globalAttributes.forEach(a => {
        console.log(`- ${a.name}: [${a.values.map(v => v.value).join(', ')}]`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
