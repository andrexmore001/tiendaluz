import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Recache every hour

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                images: true,
                priceTiers: {
                    orderBy: {
                        minQty: 'asc'
                    }
                },
            },
        });

        // Map database fields to frontend types
        const mappedProducts = products.map((p: any) => {
            const { width, height, depth, images, priceTiers, ...rest } = p;
            return {
                ...rest,
                dimensions: { width, height, depth },
                customMaterialTexture: p.materialTexture,
                images: images.map((img: any) => ({
                    url: img.url,
                    isCustomizable: img.isCustomizable,
                    textConfig: {
                        x: img.textX,
                        y: img.textY,
                        rotation: img.rotation,
                        scale: img.scale
                    }
                })),
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

        // Ensure all fields passed to Prisma exist in the schema and have correct types
        const baseData = {
            name: rest.name,
            price: Number(rest.price),
            category: rest.category,
            description: rest.description,
            image: rest.image,
            boxTexture: rest.boxTexture,
            displayMode: rest.displayMode || '3d',
            width: Number(dimensions?.width || rest.width || 4),
            height: Number(dimensions?.height || rest.height || 2),
            depth: Number(dimensions?.depth || rest.depth || 4),
            boxType: rest.boxType || 'standard',
            materialId: rest.materialId || 'carton-kraft',
            baseColor: rest.baseColor || '#F9F1E7',
            materialTexture: customMaterialTexture || rest.materialTexture,
            shapeId: rest.shapeId,
            hingeEdge: rest.hingeEdge || 'long',
            flapsLocation: rest.flapsLocation || 'base',
            flapHeightPercent: Number(rest.flapHeightPercent || 0.25),
            flapWidthOffset: Number(rest.flapWidthOffset || -0.2),
            flapType: rest.flapType || 'rectangular',
            tuckFlapHeightPercent: Number(rest.tuckFlapHeightPercent || 0.15),
        };

        const imageOperations = images?.map((img: any) => ({
            url: img.url,
            isCustomizable: !!img.isCustomizable,
            textX: Number(img.textConfig?.x || 50),
            textY: Number(img.textConfig?.y || 50),
            rotation: Number(img.textConfig?.rotation || 0),
            scale: Number(img.textConfig?.scale || 1),
        })) || [];

        const tierOperations = priceTiers?.map((tier: any) => ({
            minQty: Number(tier.minQty),
            maxQty: tier.maxQty ? Number(tier.maxQty) : null,
            unitPrice: Number(tier.unitPrice),
        })) || [];

        // Correct upsert logic: 'create' cannot have 'deleteMany'
        const product = await prisma.product.upsert({
            where: { id: id && id !== 'new' ? id : 'new-placeholder' },
            create: {
                ...baseData,
                id: id && id !== 'new' ? id : undefined,
                images: {
                    create: imageOperations,
                },
                priceTiers: {
                    create: tierOperations,
                }
            },
            update: {
                ...baseData,
                images: {
                    deleteMany: {},
                    create: imageOperations,
                },
                priceTiers: {
                    deleteMany: {},
                    create: tierOperations,
                }
            },
            include: {
                images: true,
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
