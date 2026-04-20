const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DRY_RUN = process.env.DRY_RUN !== 'false';

async function main() {
  console.log(`--- INICIANDO REPARACIÓN DE VARIANTES (${DRY_RUN ? 'SIMULACIÓN' : 'EJECUCIÓN REAL'}) ---`);

  // 1. Obtener valores de la dimensión "Medidas"
  const measureValues = await prisma.attributeValue.findMany({
    where: { attribute: { name: 'Medidas' } },
    include: { attribute: true }
  });

  // Función para normalizar strings para comparación (ej: "15 x 15 x 5 cm" -> "15155cm")
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const valueMap = measureValues.map(v => ({
    id: v.id,
    original: v.value,
    normalized: normalize(v.value)
  }));

  // 2. Obtener variantes huérfanas sin SKU DEFAULT
  const brokenVariants = await prisma.productVariant.findMany({
    where: {
      attributes: { none: {} },
      NOT: { sku: { contains: 'DEFAULT', mode: 'insensitive' } },
      isActive: true
    },
    include: { product: true }
  });

  console.log(`Encontradas ${brokenVariants.length} variantes candidatas.\n`);

  const mappings = [];

  for (const variant of brokenVariants) {
    // Intentar extraer la medida del SKU (ej: "HUA-15X15X7CM" -> "15X15X7CM")
    const skuParts = variant.sku.split('-');
    const skuSuffix = normalize(skuParts[skuParts.length - 1]);
    
    // Buscar coincidencia exacta en los valores normalizados
    const match = valueMap.find(m => m.normalized === skuSuffix);

    if (match) {
      mappings.push({
        variantId: variant.id,
        variantSku: variant.sku,
        productName: variant.product.name,
        targetValueId: match.id,
        targetValueName: match.original,
        status: 'COINCIDENCIA ENCONTRADA'
      });
    } else {
      mappings.push({
        variantId: variant.id,
        variantSku: variant.sku,
        productName: variant.product.name,
        status: 'SIN COINCIDENCIA'
      });
    }
  }

  // 3. Imprimir Tabla de Mapeo
  console.log("RESUMEN DE MAPEADO:");
  mappings.forEach(m => {
    console.log(`[${m.status}] ${m.productName} (${m.variantSku}) --> ${m.targetValueName || 'NINGUNA'}`);
  });

  if (!DRY_RUN) {
    console.log("\n--- EJECUTANDO CAMBIOS REALES ---");
    const linked = mappings.filter(m => m.status === 'COINCIDENCIA ENCONTRADA');
    let successCount = 0;
    
    for (const m of linked) {
        try {
            await prisma.variantAttributeValue.create({
                data: {
                    variantId: m.variantId,
                    attributeValueId: m.targetValueId
                }
            });
            successCount++;
        } catch (e) {
            console.error(`Error vinculando ${m.variantSku}:`, e.message);
        }
    }
    console.log(`Reparación completada. Se vincularon ${successCount} variantes.`);
  } else {
    console.log("\n>>> MODO SIMULACIÓN: No se realizaron cambios. Revisa la lista de arriba.");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
