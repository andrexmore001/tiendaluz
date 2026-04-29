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
        const { status, customerName, customerEmail, customerPhone, total, lostReason, source, items } = data;

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
                lostReason: lostReason ?? undefined,
                source: source ?? undefined,
                items: items ?? undefined
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

        // Sync discount changes back to the linked Quote's items
        if (items && currentOrder.quoteId) {
            try {
                const quote = await prisma.quote.findUnique({
                    where: { id: currentOrder.quoteId },
                    include: { items: true }
                });

                if (quote) {
                    // Rebuild QuoteItems from order items
                    await prisma.quoteItem.deleteMany({ where: { quoteId: quote.id } });
                    await prisma.quoteItem.createMany({
                        data: (items as any[]).map((i: any) => ({
                            quoteId: quote.id,
                            description: i.name,
                            qty: i.qty,
                            unitPrice: i.price,
                            originalPrice: i.originalPrice ?? i.price,
                            discountValue: i.discountValue ?? 0,
                            discountType: i.discountType ?? 'percentage',
                        }))
                    });

                    // Recalculate quote total
                    const newTotal = (items as any[]).reduce((acc: number, i: any) => acc + (i.price * i.qty), 0);
                    await prisma.quote.update({
                        where: { id: quote.id },
                        data: { total: newTotal, subtotal: newTotal }
                    });
                }
            } catch (syncErr) {
                // Log but don't fail the main request — order update was successful
                console.warn('Warning: could not sync items to Quote:', syncErr);
            }
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
        // Find the order first to get the linked quoteId
        const order = await prisma.order.findUnique({ where: { id } });

        // Delete the order (OrderNotes cascade automatically via schema)
        await prisma.order.delete({ where: { id } });

        // If there was a linked Quote, delete it too (QuoteItems cascade via schema)
        if (order?.quoteId) {
            await prisma.quote.delete({ where: { id: order.quoteId } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Error al eliminar pedido' }, { status: 500 });
    }
}
