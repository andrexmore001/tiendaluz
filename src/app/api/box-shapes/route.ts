import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const shapes = await prisma.boxShape.findMany();
        return NextResponse.json(shapes);
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

        return NextResponse.json(shape);
    } catch (error) {
        return NextResponse.json({ error: 'Error saving shape' }, { status: 500 });
    }
}
