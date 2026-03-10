import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch all data in parallel to minimize wait time
        const [settingsData, rawProducts, collections, materials, messages] = await Promise.all([
            prisma.setting.findFirst(),
            prisma.product.findMany({
                include: {
                    priceTiers: {
                        orderBy: {
                            minQty: 'asc'
                        }
                    },
                },
            }),
            prisma.collection.findMany(),
            prisma.material.findMany(),
            prisma.contactMessage.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            })
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
            const { width, height, depth, priceTiers, ...rest } = p;
            return {
                ...rest,
                dimensions: { width, height, depth },
                priceTiers: priceTiers || []
            };
        });

        const session = await auth();

        const bootstrapData: any = {
            settings,
            products,
            collections,
            materials,
        };

        // Only include messages for authenticated admins
        if (session) {
            bootstrapData.messages = messages;
        }

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
