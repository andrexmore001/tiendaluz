const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalize(str) {
    return str.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function main() {
    console.log('--- Iniciando recuperación de variantes ---');

    // 1. Obtener todos los valores de atributos con sus IDs
    const allValues = await prisma.attributeValue.findMany({
        include: { attribute: true }
    });

    const normalizedMap = allValues.map(v => ({
        id: v.id,
        original: v.value,
        normalized: normalize(v.value),
        attrName: v.attribute.name
    }));

    // 2. Encontrar variantes sin atributos
    const variants = await prisma.productVariant.findMany({
        where: {
            attributes: { none: {} }
        },
        include: { product: true }
    });

    console.log(`Encontradas ${variants.length} variantes sin atributos.`);

    let recoveredCount = 0;

    for (const v of variants) {
        const sku = v.sku.toUpperCase();
        const matches = [];

        for (const val of normalizedMap) {
            // Si el valor normalizado está contenido en el SKU
            // y es suficientemente largo para no ser una coincidencia accidental (ej: "S")
            if (val.normalized.length > 0 && sku.includes(val.normalized)) {
                matches.push(val);
            }
        }

        if (matches.length > 0) {
            console.log(`Variante ${v.sku} del producto "${v.product.name}":`);
            
            // Si hay múltiples coincidencias, intentar ser más preciso
            // Por ejemplo, si tenemos "15X15X12CM" y "15X15X12", preferimos la más larga
            matches.sort((a, b) => b.normalized.length - a.normalized.length);
            
            // Tomamos la mejor coincidencia (o las mejores si son de diferentes atributos)
            // Para simplificar, tomaremos todas las que no se solapen o simplemente la primera si es única
            const bestMatch = matches[0];
            
            try {
                await prisma.variantAttributeValue.create({
                    data: {
                        variantId: v.id,
                        attributeValueId: bestMatch.id
                    }
                });
                console.log(`  ✅ Recuperado: Atributo "${bestMatch.attrName}" -> Valor "${bestMatch.original}"`);
                recoveredCount++;
            } catch (err) {
                if (err.code === 'P2002') {
                    // Ya existía (extraño si filtramos por none)
                } else {
                    console.error(`  ❌ Error al recuperar ${v.sku}:`, err.message);
                }
            }
        } else {
            // console.log(`  ❓ No se encontró coincidencia para ${v.sku}`);
        }
    }

    console.log(`--- Proceso finalizado. Se recuperaron ${recoveredCount} vínculos de atributos ---`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
