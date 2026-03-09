import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        // Fetch all data in parallel to minimize wait time
        const [settingsData, rawProducts, collections, materials, rawShapes] = await Promise.all([
            prisma.setting.findFirst(),
            prisma.product.findMany({
                include: {
                    images: true,
                    priceTiers: {
                        orderBy: {
                            minQty: 'asc'
                        }
                    },
                },
            }),
            prisma.collection.findMany(),
            prisma.material.findMany(),
            prisma.boxShape.findMany()
        ]);

        // 1. Process Settings (Create defaults if missing)
        let settings = settingsData;
        if (!settings) {
            settings = await prisma.setting.create({
                data: {
                    id: 'site-settings',
                    title: 'Artesana',
                }
            });
        }

        // 2. Map Products
        const products = rawProducts.map((p: any) => {
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

        // 3. Map Box Shapes
        const boxShapes = rawShapes.map(s => {
            const { width, height, depth, ...rest } = s;
            return {
                ...rest,
                defaultDimensions: { width, height, depth }
            };
        });

        const bootstrapData = {
            settings,
            products,
            collections,
            materials,
            boxShapes
        };

        return new NextResponse(JSON.stringify(bootstrapData), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        console.error('Error in bootstrap API:', error);
        return NextResponse.json({ error: 'Error al cargar datos iniciales' }, { status: 500 });
    }
}
