import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { quote: true }
        });

        if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

        // Generate quote number if doesn't exist
        const quoteNumber = order.quote?.quoteNumber || `S-${order.orderNumber.replace('ART-', '').replace('ORD-', '')}`;
        
        const items = (order.items as any[]) || [];
        const subtotal = items.reduce((acc, i) => acc + (i.price * i.qty), 0);

        const quote = await prisma.quote.upsert({
            where: { quoteNumber },
            update: {
                clientName: order.customerName,
                customerCompany: order.customerCompany,
                subtotal,
                total: subtotal,
                items: {
                    deleteMany: {},
                    create: items.map(i => ({
                        description: i.name,
                        qty: i.qty,
                        unitPrice: i.price
                    }))
                }
            },
            create: {
                quoteNumber,
                clientName: order.customerName,
                customerCompany: order.customerCompany,
                vendor: 'Admin', // Default
                billingAddress: '',
                shippingAddress: '',
                subtotal,
                total: subtotal,
                customerId: order.customerId,
                items: {
                    create: items.map(i => ({
                        description: i.name,
                        qty: i.qty,
                        unitPrice: i.price
                    }))
                }
            }
        });

        // Link back to order and update status
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { 
                quoteId: quote.id,
                status: 'QUOTE' 
            },
            include: {
                notes: { orderBy: { createdAt: 'desc' } },
                quote: { include: { items: true } }
            }
        });

        // Add note if status changed
        if (order.status !== 'QUOTE') {
            await prisma.orderNote.create({
                data: {
                    orderId: id,
                    content: `Estado cambiado automáticamente a Cotización (QUOTE) al generar documento formal.`
                }
            });
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error generating quote:', error);
        return NextResponse.json({ error: 'Error al generar cotización' }, { status: 500 });
    }
}
