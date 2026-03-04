import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const collections = await prisma.collection.findMany();
        return NextResponse.json(collections);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching collections' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { id, ...rest } = data;

        const collection = await prisma.collection.upsert({
            where: { id: id || 'new' },
            update: rest,
            create: { ...rest, id: id || undefined },
        });

        return NextResponse.json(collection);
    } catch (error) {
        return NextResponse.json({ error: 'Error saving collection' }, { status: 500 });
    }
}
