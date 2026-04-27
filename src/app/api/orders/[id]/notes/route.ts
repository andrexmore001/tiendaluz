import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    try {
        const { content } = await request.json();
        if (!content) return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 });

        const note = await prisma.orderNote.create({
            data: {
                orderId: id,
                content
            }
        });

        // Touch the order to update updatedAt
        await prisma.order.update({
            where: { id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('Error creating order note:', error);
        return NextResponse.json({ error: 'Error al crear observación' }, { status: 500 });
    }
}
