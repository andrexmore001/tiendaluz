import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Recache every hour

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                priceTiers: {
                    orderBy: {
                        minQty: 'asc'
                    }
                },
            },
        });

        const mappedProducts = products.map((p: any) => {
            const { width, height, depth, priceTiers, ...rest } = p;
            return {
                ...rest,
                dimensions: { width, height, depth },
                customMaterialTexture: p.materialTexture,
                priceTiers: priceTiers || []
            };
        });

        return new NextResponse(JSON.stringify(mappedProducts), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { id, images, dimensions, customMaterialTexture, priceTiers, ...rest } = data;

        const baseData = {
            name: rest.name,
            price: Number(rest.price),
            category: rest.category,
            description: rest.description || '',
            image: rest.image || '',
            displayMode: rest.displayMode || '3d',
            width: Number(dimensions?.width || rest.width || 4),
            height: Number(dimensions?.height || rest.height || 2),
            depth: Number(dimensions?.depth || rest.depth || 4),
            materialId: rest.materialId || 'carton-kraft',
            baseColor: rest.baseColor || '#F9F1E7',
            images: images || [], // Now a JSON field
        };

        const tierOperations = priceTiers?.map((tier: any) => ({
            minQty: Number(tier.minQty),
            maxQty: tier.maxQty ? Number(tier.maxQty) : null,
            unitPrice: Number(tier.unitPrice),
        })) || [];

        const product = await prisma.product.upsert({
            where: { id: id && id !== 'new' ? id : 'new-placeholder' },
            create: {
                ...baseData,
                id: id && id !== 'new' ? id : undefined,
                priceTiers: {
                    create: tierOperations,
                }
            },
            update: {
                ...baseData,
                priceTiers: {
                    deleteMany: {},
                    create: tierOperations,
                }
            },
            include: {
                priceTiers: true
            }
        });

        revalidatePath('/api/products');
        revalidatePath('/api/bootstrap');
        return NextResponse.json(product);
    } catch (error) {
        console.error('Error saving product:', error);
        return NextResponse.json({ error: 'Error al guardar producto' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id },
        });

        revalidatePath('/api/products');
        revalidatePath('/api/bootstrap');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
    }
}
