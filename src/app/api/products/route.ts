import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                images: true,
            },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { id, images, dimensions, ...rest } = data;

        // Use upsert to handle both create and update
        const product = await prisma.product.upsert({
            where: { id: id || 'new' },
            update: {
                ...rest,
                width: dimensions?.width,
                height: dimensions?.height,
                depth: dimensions?.depth,
                images: {
                    deleteMany: {},
                    create: images.map((img: any) => ({
                        url: img.url,
                        textX: img.textConfig?.x,
                        textY: img.textConfig?.y,
                        rotation: img.textConfig?.rotation,
                        scale: img.textConfig?.scale,
                    })),
                },
            },
            create: {
                ...rest,
                id: id || undefined,
                width: dimensions?.width,
                height: dimensions?.height,
                depth: dimensions?.depth,
                images: {
                    create: images.map((img: any) => ({
                        url: img.url,
                        textX: img.textConfig?.x,
                        textY: img.textConfig?.y,
                        rotation: img.textConfig?.rotation,
                        scale: img.textConfig?.scale,
                    })),
                },
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error saving product:', error);
        return NextResponse.json({ error: 'Error al guardar producto' }, { status: 500 });
    }
}
