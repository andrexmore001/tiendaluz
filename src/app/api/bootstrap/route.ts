import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch all data in parallel to minimize wait time
        const [settingsData, rawProducts, collections, materials, messages, attributes] = await Promise.all([
            prisma.setting.findFirst(),
            prisma.product.findMany({
                orderBy: {
                    updatedAt: 'desc'
                },
                include: {
                    priceTiers: {
                        orderBy: {
                            minQty: 'asc'
                        }
                    },
                    variants: {
                        include: {
                            attributes: {
                                include: {
                                    attributeValue: {
                                        include: { attribute: true }
                                    }
                                }
                            }
                        }
                    }
                },
            }),
            prisma.collection.findMany(),
            prisma.material.findMany(),
            prisma.contactMessage.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.attribute.findMany({
                include: { values: true }
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
            attributes,
        };

        // Only include messages for authenticated admins
        if (session) {
            bootstrapData.messages = messages;
        } else {
            // If not admin, hide products that are not visible
            bootstrapData.products = bootstrapData.products.filter((p: any) => p.isVisible !== false);
        }

        return new NextResponse(JSON.stringify(bootstrapData), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
        });
    } catch (error) {
        console.error('Error in bootstrap API:', error);
        return NextResponse.json({ error: 'Error al cargar datos iniciales' }, { status: 500 });
    }
}
