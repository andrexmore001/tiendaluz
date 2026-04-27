import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/slug';

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { csv } = await req.json();
        if (!csv) return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });

        // Standardize line endings and filter empty lines
        const lines = csv.split(/\r?\n/).map((l: string) => l.trim()).filter((l: string) => l !== '');
        if (lines.length < 2) return NextResponse.json({ error: 'CSV is empty or missing header' }, { status: 400 });

        // Detect delimiter: use the first line to check if there are more ; or ,
        const firstLine = lines[0];
        const delimiter = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';

        const parseCSVLine = (line: string) => {
            const result: string[] = [];
            let inQuotes = false;
            let current = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === delimiter && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        const dataRows = lines.slice(1);

        // Initial fetch for materials to validate
        const materials = await prisma.material.findMany({ select: { id: true } });
        const validMaterialIds = new Set(materials.map(m => m.id));
        const invalidMaterials = new Set<string>();

        // Step 1: Parse rows into raw products and extract unique missing categories
        const unmappedProductsData = dataRows.map((line: string, lineIndex: number) => {
            const values = parseCSVLine(line);
            const product: any = {};

            headers.forEach((header: string, index: number) => {
                const value = values[index];
                if (value === undefined || value === '') return;

                if (header === 'precio' || header === 'price') product.price = parseFloat(value) || 0;
                else if (header === 'nombre' || header === 'name') product.name = value;
                else if (header === 'colección' || header === 'coleccion' || header === 'collection' || header === 'categoría' || header === 'categoria' || header === 'category') product.categoryText = value;
                else if (header === 'descripción' || header === 'descripcion' || header === 'description') product.description = value;
                else if (header === 'imagen' || header === 'image') product.image = value;
                else if (header === 'ancho' || header === 'width') product.width = parseFloat(value) || 0;
                else if (header === 'alto' || header === 'height') product.height = parseFloat(value) || 0;
                else if (header === 'profundidad' || header === 'depth') product.depth = parseFloat(value) || 0;

                else if (header === 'material' || header === 'materialid') product.materialId = value;
                else if (header === 'color' || header === 'basecolor') product.baseColor = value;

                else if (header === 'visible' || header === 'isvisible') {
                    const normalized = value.toLowerCase().trim();
                    product.isVisible = normalized === 'true' || normalized === 'si' || normalized === 'sí' || normalized === '1';
                }
                else if (header === 'rotacion' || header === 'rotación' || header === 'isrotationenabled') {
                    const normalized = value.toLowerCase().trim();
                    product.isRotationEnabled = normalized === 'true' || normalized === 'si' || normalized === 'sí' || normalized === '1';
                }
                else if (header === 'galeria' || header === 'gallery') {
                    const urls = value.split(';').map(u => u.trim()).filter(u => u !== '');
                    product.images = urls.map(url => ({ url, isCustomizable: false }));
                }
            });

            if (!product.name) product.name = `Producto en línea ${lineIndex + 2}`;
            if (product.price === undefined) product.price = 0;
            if (!product.categoryText) product.categoryText = 'General';
            if (!product.description) product.description = '';

            if (!product.materialId) product.materialId = '';
            if (!product.baseColor) product.baseColor = '#F9F1E7';

            // Generar slug automático para SEO y navegabilidad
            product.slug = slugify(product.name);

            if (!validMaterialIds.has(product.materialId)) invalidMaterials.add(product.materialId);

            return product;
        });

        if (invalidMaterials.size > 0) {
            return NextResponse.json({ error: `Errores de validación en el CSV: Los siguientes materiales no existen: ${Array.from(invalidMaterials).join(', ')}` }, { status: 400 });
        }

        // Step 2: Resolver la columna Colección — acepta ID o nombre
        // Prioridad: 1) ID exacto en BD, 2) Nombre exacto en BD, 3) Crear nueva colección
        const allCollections = await prisma.collection.findMany({
            select: { id: true, name: true }
        });
        const colById  = new Map(allCollections.map(c => [c.id, c]));
        const colByName = new Map(allCollections.map(c => [c.name.toLowerCase(), c]));

        // Construir mapa categoryText → collectionId definitivo
        const categoryMap = new Map<string, string>();

        for (const p of unmappedProductsData) {
            const text: string = p.categoryText;
            if (categoryMap.has(text)) continue;

            if (colById.has(text)) {
                // El CSV tiene el ID directamente → usarlo sin tocar la BD
                categoryMap.set(text, text);
            } else if (colByName.has(text.toLowerCase())) {
                // El CSV tiene el nombre → resolver al ID correspondiente
                categoryMap.set(text, colByName.get(text.toLowerCase())!.id);
            } else {
                // No existe ni por ID ni por nombre → crear colección nueva
                const created = await prisma.collection.upsert({
                    where: { name: text },
                    create: {
                        name: text,
                        description: 'Creada desde carga masiva CSV',
                        slug: slugify(text)
                    },
                    update: {}
                });
                categoryMap.set(text, created.id);
            }
        }

        // Step 3: Asignar collectionId a cada producto
        const productsData = unmappedProductsData.map((p: any) => {
            const { categoryText, ...rest } = p;
            return {
                ...rest,
                collectionId: categoryMap.get(categoryText)
            };
        });

        const result = await prisma.product.createMany({
            data: productsData,
            skipDuplicates: false
        });

        revalidatePath('/api/bootstrap');

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} productos cargados exitosamente con sus imágenes de galería.`
        });

    } catch (error: any) {
        console.error('Error in bulk upload:', error);
        return NextResponse.json({ error: 'Error al procesar la carga masiva: ' + error.message }, { status: 500 });
    }
}
