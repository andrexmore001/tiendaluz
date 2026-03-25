import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Recache every hour

export async function GET() {
    try {
        const collections = await prisma.collection.findMany();
        return new NextResponse(JSON.stringify(collections), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching collections' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { id, parentId, newSubcategories, ...rest } = data;

        const collection = await prisma.collection.upsert({
            where: { id: id || 'new' },
            update: { ...rest, parentId: parentId || null },
            create: { ...rest, parentId: parentId || null, id: id || undefined },
        });

        // Creación masiva de subcategorías vinculadas al padre
        if (newSubcategories && Array.isArray(newSubcategories) && newSubcategories.length > 0) {
            for (const subName of newSubcategories) {
                if (typeof subName === 'string' && subName.trim()) {
                    const cleanName = subName.trim();
                    const exists = await prisma.collection.findUnique({ where: { name: cleanName }});
                    if (!exists) {
                        await prisma.collection.create({
                            data: {
                                name: cleanName,
                                parentId: collection.id
                            }
                        });
                    }
                }
            }
        }

        revalidatePath('/api/collections');
        revalidatePath('/api/bootstrap');
        return NextResponse.json(collection);
    } catch (error) {
        return NextResponse.json({ error: 'Error saving collection' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID de colección requerido' }, { status: 400 });
        }

        await prisma.collection.delete({
            where: { id },
        });

        revalidatePath('/api/collections');
        revalidatePath('/api/bootstrap');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting collection:', error);
        return NextResponse.json({ error: 'Error al eliminar colección' }, { status: 500 });
    }
}
