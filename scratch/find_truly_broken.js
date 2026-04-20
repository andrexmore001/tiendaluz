const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Obtener todos los productos con variantes huérfanas
    const brokenProducts = await prisma.product.findMany({
        where: {
            variants: {
                some: {
                    attributes: { none: {} }
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

    const finalReport = [];

    for (const product of brokenProducts) {
        // Filtro del usuario: Ignorar si el producto solo tiene UNA variante y es la DEFAULT
        const isSimpleDefault = product.variants.length === 1 && product.variants[0].sku.toUpperCase().includes('DEFAULT');
        
        if (!isSimpleDefault) {
            // Este producto es problemático:
            // O tiene múltiples variantes sin atributos (como las bandejas)
            // O tiene una variante DEFAULT "fantasma" conviniendo con otras reales.
            
            product.variants.forEach(v => {
               if (v.attributes.length === 0) {
                   finalReport.push({
                       producto: product.name,
                       sku: v.sku,
                       id_producto: product.id,
                       razon: product.variants.length > 1 ? 'Múltiples opciones sin atributos' : 'Variante única con SKU personalizado pero sin atributos'
                   });
               }
            });
        }
    }

    console.log(JSON.stringify(finalReport, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
