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

    if (!product) {
        console.log("Producto no encontrado");
        return;
    }

    console.log(`Producto: ${product.name} (ID: ${product.id})`);
    console.log(`Imágenes principales: ${JSON.stringify(product.images)}`);
    console.log(`Variantes activas: ${product.variants.length}`);
    
    product.variants.forEach(v => {
        console.log(`- Variante SKU: ${v.sku}, Imagen: ${v.image || 'N/A'}, Activa: ${v.isActive}`);
        v.attributes.forEach(a => {
            console.log(`  * ${a.attributeValue.attribute.name}: ${a.attributeValue.value}`);
        });
    });
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
