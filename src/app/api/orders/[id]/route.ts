import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const data = await request.json();
        const { status, customerName, customerEmail, customerPhone, total, lostReason } = data;

        const currentOrder = await prisma.order.findUnique({
            where: { id }
        });

        if (!currentOrder) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: status ?? undefined,
                customerName: customerName ?? undefined,
                customerEmail: customerEmail ?? undefined,
                customerPhone: customerPhone ?? undefined,
                total: total !== undefined ? Number(total) : undefined,
                lostReason: lostReason ?? undefined
            },
            include: {
                notes: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        // If status changed, add a system note
        if (status && status !== currentOrder.status) {
            let noteContent = `Estado cambiado de ${currentOrder.status} a ${status}`;
            if (status === 'LOST' && lostReason) {
                noteContent += `. Motivo: ${lostReason}`;
            }
            await prisma.orderNote.create({
                data: {
                    orderId: id,
                    content: noteContent
                }
            });
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        await prisma.order.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Error al eliminar pedido' }, { status: 500 });
    }
}
