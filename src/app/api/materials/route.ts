import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Recache every hour

export async function GET() {
    try {
        const materials = await prisma.material.findMany();
        return NextResponse.json(materials);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching materials' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { id, ...rest } = data;

        const material = await prisma.material.upsert({
            where: { id: id || 'new' },
            update: rest,
            create: { ...rest, id: id || undefined },
        });

        revalidatePath('/api/materials');
        return NextResponse.json(material);
    } catch (error) {
        return NextResponse.json({ error: 'Error saving material' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID de material requerido' }, { status: 400 });
        }

        await prisma.material.delete({
            where: { id },
        });

        revalidatePath('/api/materials');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting material:', error);
        return NextResponse.json({ error: 'Error al eliminar material' }, { status: 500 });
    }
}
