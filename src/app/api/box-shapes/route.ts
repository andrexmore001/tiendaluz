import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Recache every hour

export async function GET() {
    try {
        const shapes = await prisma.boxShape.findMany();

        // Map database fields to frontend types
        const mappedShapes = shapes.map(s => {
            const { width, height, depth, ...rest } = s;
            return {
                ...rest,
                defaultDimensions: { width, height, depth }
            };
        });

        return new NextResponse(JSON.stringify(mappedShapes), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching shapes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { id, defaultDimensions, ...rest } = data;

        const shape = await prisma.boxShape.upsert({
            where: { id: id || 'new' },
            update: {
                ...rest,
                width: defaultDimensions?.width,
                height: defaultDimensions?.height,
                depth: defaultDimensions?.depth,
            },
            create: {
                ...rest,
                id: id || undefined,
                width: defaultDimensions?.width,
                height: defaultDimensions?.height,
                depth: defaultDimensions?.depth,
            },
        });

        revalidatePath('/api/box-shapes');
        revalidatePath('/api/bootstrap');
        return NextResponse.json(shape);
    } catch (error) {
        return NextResponse.json({ error: 'Error saving shape' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID de forma requerido' }, { status: 400 });
        }

        await prisma.boxShape.delete({
            where: { id },
        });

        revalidatePath('/api/box-shapes');
        revalidatePath('/api/bootstrap');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting shape:', error);
        return NextResponse.json({ error: 'Error al eliminar forma' }, { status: 500 });
    }
}
