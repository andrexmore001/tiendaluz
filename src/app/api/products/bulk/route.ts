import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { csv } = await req.json();
        if (!csv) return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });

        const lines = csv.split('\n').filter((l: string) => l.trim() !== '');
        if (lines.length < 2) return NextResponse.json({ error: 'CSV is empty or missing header' }, { status: 400 });

        const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
        const dataRows = lines.slice(1);

        const productsData = dataRows.map((line: string) => {
            const values = line.split(',').map((v: string) => v.trim());
            const product: any = {};

            headers.forEach((header: string, index: number) => {
                const value = values[index];
                if (!value) return;

                if (header === 'precio' || header === 'price') product.price = parseFloat(value) || 0;
                else if (header === 'nombre' || header === 'name') product.name = value;
                else if (header === 'categoría' || header === 'categoria' || header === 'category') product.category = value;
                else if (header === 'descripción' || header === 'descripcion' || header === 'description') product.description = value;
                else if (header === 'imagen' || header === 'image') product.image = value;
                else if (header === 'ancho' || header === 'width') product.width = parseFloat(value) || 4;
                else if (header === 'alto' || header === 'height') product.height = parseFloat(value) || 2;
                else if (header === 'profundidad' || header === 'depth') product.depth = parseFloat(value) || 4;
                else if (header === 'modelo' || header === 'modelurl') product.modelUrl = value;
                else if (header === 'material' || header === 'materialid') product.materialId = value || 'carton-kraft';
                else if (header === 'color' || header === 'basecolor') product.baseColor = value || '#F9F1E7';
                else if (header === 'modo' || header === 'displaymode') product.displayMode = value || '3d';
                else if (header === 'galeria' || header === 'gallery') {
                    const urls = value.split(';').map(u => u.trim()).filter(u => u !== '');
                    product.images = urls.map(url => ({ url, isCustomizable: false }));
                }
            });

            if (!product.name) product.name = 'Producto sin nombre';
            if (!product.category) product.category = 'General';
            if (!product.description) product.description = '';

            return product;
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
