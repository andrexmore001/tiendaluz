import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slug';

export const revalidate = 3600; // Recache every hour

export async function GET() {
    try {
        const products = await prisma.product.findMany({
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
                                    include: {
                                        attribute: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });

        const mappedProducts = products.map((p: any) => {
            const { width, height, depth, priceTiers, ...rest } = p;
            return {
                ...rest,
                dimensions: { width, height, depth },
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
        const { id, images, dimensions, priceTiers, materialId, variants, ...rest } = data;

        if (!materialId) {
            return NextResponse.json({ error: 'El ID de material es obligatorio' }, { status: 400 });
        }

        const baseData = {
            name: rest.name,
            price: Number(rest.price),
            category: rest.category || 'General',
            collectionId: rest.collectionId || rest.category,
            description: rest.description || '',
            image: rest.image || '',
            displayMode: rest.displayMode || '3d',
            width: Number(dimensions?.width || rest.width || 4),
            height: Number(dimensions?.height || rest.height || 2),
            depth: Number(dimensions?.depth || rest.depth || 4),
            materialId: materialId,
            baseColor: rest.baseColor || '#F9F1E7',
            modelUrl: rest.modelUrl || '',
            images: images || [], // Now a JSON field
            isVisible: rest.isVisible !== undefined ? (typeof rest.isVisible === 'boolean' ? rest.isVisible : rest.isVisible === 'true') : true,
            slug: rest.slug || slugify(rest.name),
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

        // Asegurarnos que tenga al menos una variante si no se mandaron variantes (comportamiento legacy)
        if (!variants || variants.length === 0) {
            const existingVariants = await prisma.productVariant.count({ where: { productId: product.id } });
            if (existingVariants === 0) {
                const baseSku = product.name.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                
                await prisma.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: `${baseSku}-DEFAULT-${product.id.substring(0, 4)}`,
                        price: product.price,
                        stock: 10,
                        isActive: true,
                        image: product.image
                    }
                });
            }
        } else {
            // Lógica completa para guardar variantes desde el Frontend
            await prisma.productVariant.deleteMany({ where: { productId: product.id } });

            for (const v of variants) {
                const variantAttributes = [];
                if (v.attributes && Array.isArray(v.attributes)) {
                    for (const a of v.attributes) {
                        let targetAttrId = a.attrId;
                        let targetValue = a.value;

                        // Si viene desde la lectura de la base de datos (edición), 'a' tiene 'attributeValue'
                        if (a.attributeValue) {
                            targetAttrId = a.attributeValue.attributeId;
                            targetValue = a.attributeValue.value;
                        }

                        if (targetAttrId && targetValue) {
                            const attrVal = await prisma.attributeValue.findFirst({
                                where: { attributeId: targetAttrId, value: String(targetValue) }
                            });
                            if (attrVal) {
                                variantAttributes.push({ attributeValueId: attrVal.id });
                            }
                        }
                    }
                }

                await prisma.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: v.sku || `SKU-${Date.now()}`,
                        price: v.price !== undefined ? Number(v.price) : null,
                        stock: v.stock !== undefined ? Number(v.stock) : 0,
                        isActive: v.isActive !== undefined ? v.isActive : true,
                        image: v.image || null,
                        attributes: variantAttributes.length > 0 ? {
                            create: variantAttributes
                        } : undefined
                    }
                });
            }
        }

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
