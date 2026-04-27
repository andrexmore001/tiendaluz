import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const orders = await prisma.order.findMany({
            include: {
                notes: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await request.json();
        const { customerName, customerEmail, customerPhone, total, status, items, quoteId } = data;

        // Generate unique order number (e.g. ART-2024-001)
        const date = new Date();
        const year = date.getFullYear();
        const count = await prisma.order.count();
        const orderNumber = `ART-${year}-${(count + 1).toString().padStart(4, '0')}`;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerName,
                customerEmail,
                customerPhone,
                total: Number(total || 0),
                status: status || 'LEAD',
                items: items || [],
                quoteId: quoteId || null
            },
            include: {
                notes: true
            }
        });

        // Add initial note
        await prisma.orderNote.create({
            data: {
                orderId: order.id,
                content: `Pedido creado manualmente como ${status || 'LEAD'}`
            }
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 });
    }
}
