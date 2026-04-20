const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Obtener todos los productos que tienen al menos una variante "DEFAULT"
    const productsWithDefault = await prisma.product.findMany({
        where: {
            variants: {
                some: {
                    sku: { contains: 'DEFAULT', mode: 'insensitive' }
                }
            }
        },
        include: {
            variants: {
                include: {
                    attributes: true
                }
            }
        }
    });

    const refinedReport = [];

    for (const product of productsWithDefault) {
        // "Quita las que SOLO tienen la variante inicial que es la default"
        // Si el producto tiene más de 1 variante, o si la variante default tiene algo raro...
        // Pero el criterio del usuario es: si (total variantes == 1) Y (es default) -> IGNORAR.
        
        if (product.variants.length > 1) {
            // Este producto tiene la variante DEFAULT y ADEMÁS otras variantes.
            // Esto es un error claro (variante fantasma).
            const defaultVar = product.variants.find(v => v.sku.toUpperCase().includes('DEFAULT'));
            refinedReport.push({
                producto: product.name,
                sku_problema: defaultVar ? defaultVar.sku : 'N/A',
                razon: 'Tiene variante DEFAULT duplicada con otras variantes reales.',
                id_producto: product.id
            });
        }
    }

    console.log(JSON.stringify(refinedReport, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
