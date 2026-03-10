import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { id } = await params;

        await prisma.contactMessage.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        return NextResponse.json({ error: 'Error al eliminar el mensaje' }, { status: 500 });
    }
}
