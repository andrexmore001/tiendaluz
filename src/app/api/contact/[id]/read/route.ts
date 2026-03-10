import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { id } = await params;

        const updatedMessage = await prisma.contactMessage.update({
            where: { id },
            data: { read: true }
        });

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error('Error marking message as read:', error);
        return NextResponse.json({ error: 'Error al marcar el mensaje como leído' }, { status: 500 });
    }
}
