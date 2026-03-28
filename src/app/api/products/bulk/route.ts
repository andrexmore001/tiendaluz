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
                else if (header === 'categoría' || header === 'categoria' || header === 'category') product.category = value;
                else if (header === 'descripción' || header === 'descripcion' || header === 'description') product.description = value;
                else if (header === 'imagen' || header === 'image') product.image = value;
                else if (header === 'ancho' || header === 'width') product.width = parseFloat(value) || 0;
                else if (header === 'alto' || header === 'height') product.height = parseFloat(value) || 0;
                else if (header === 'profundidad' || header === 'depth') product.depth = parseFloat(value) || 0;
                else if (header === 'modelo' || header === 'modelurl') product.modelUrl = value;
                else if (header === 'material' || header === 'materialid') product.materialId = value;
                else if (header === 'color' || header === 'basecolor') product.baseColor = value;
                else if (header === 'modo' || header === 'displaymode') product.displayMode = value;
                else if (header === 'visible' || header === 'isvisible') {
                    const normalized = value.toLowerCase().trim();
                    product.isVisible = normalized === 'true' || normalized === 'si' || normalized === 'sí' || normalized === '1';
                }
                else if (header === 'galeria' || header === 'gallery') {
                    const urls = value.split(';').map(u => u.trim()).filter(u => u !== '');
                    product.images = urls.map(url => ({ url, isCustomizable: false }));
                }
            });

            if (!product.name) product.name = `Producto en línea ${lineIndex + 2}`;
            if (product.price === undefined) product.price = 0;
            if (!product.category) product.category = 'General';
            if (!product.description) product.description = '';
            if (!product.displayMode) product.displayMode = '3d';
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

        // Step 2: Extract unique categories and ensure they exist
        const uniqueCategories = [...new Set(unmappedProductsData.map((p: any) => p.category))];
        const existingCollections = await prisma.collection.findMany({
            where: { name: { in: uniqueCategories as string[] } }
        });
        const existingColNames = new Set(existingCollections.map(c => c.name));

        const newCategories = (uniqueCategories as string[]).filter(c => !existingColNames.has(c));
        
        // Create missing collections sequentially (createMany isn't supported on SQLite but is on Postgres, we use loop to be safe if fallback or handle nested in future)
        for (const cat of newCategories) {
            await prisma.collection.upsert({
                where: { name: cat },
                create: { 
                    name: cat, 
                    description: 'Creada desde carga masiva CSV',
                    slug: slugify(cat) 
                },
                update: {}
            });
        }

        // Fetch all again to get standard IDs map
        const finalCollections = await prisma.collection.findMany({
            where: { name: { in: uniqueCategories as string[] } }
        });
        const collectionNameToId = new Map(finalCollections.map(c => [c.name, c.id]));

        // Step 3: Map collectionId to the product payload
        const productsData = unmappedProductsData.map((p: any) => ({
            ...p,
            collectionId: collectionNameToId.get(p.category)
        }));

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
