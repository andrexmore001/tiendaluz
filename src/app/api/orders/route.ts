import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Sync logic: Find quotes without orders and create them as orders in QUOTE stage
        const quotesWithoutOrders = await prisma.quote.findMany({
            where: {
                order: null
            },
            include: {
                items: true
            }
        });

        for (const quote of quotesWithoutOrders) {
            try {
                const order = await prisma.order.create({
                    data: {
                        orderNumber: `ORD-${quote.quoteNumber}`,
                        status: 'QUOTE',
                        customerName: quote.clientName,
                        total: quote.total,
                        quoteId: quote.id,
                        items: quote.items.map(i => ({ name: i.description, qty: i.qty, price: i.unitPrice }))
                    }
                });
                
                await prisma.orderNote.create({
                    data: {
                        orderId: order.id,
                        content: `Pedido sincronizado automáticamente desde la cotización ${quote.quoteNumber}`
                    }
                });
            } catch (syncErr) {
                console.error(`Error syncing quote ${quote.quoteNumber}:`, syncErr);
                // Continue with others
            }
        }

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
        const { customerName, customerCompany, customerEmail, customerPhone, total, status, items, quoteId } = data;

        // Generate unique order number (e.g. ART-2024-001)
        const date = new Date();
        const year = date.getFullYear();
        const count = await prisma.order.count();
        const orderNumber = `ART-${year}-${(count + 1).toString().padStart(4, '0')}`;

        // Find or create customer
        let customer = await prisma.customer.findFirst({
            where: { name: { equals: customerName.trim(), mode: 'insensitive' } }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name: customerName.trim(),
                    companyName: customerCompany || null,
                    email: customerEmail || null,
                    phone: customerPhone || null,
                }
            });
        } else {
            // Update email/phone/company if provided and missing
            if ((customerEmail && !customer.email) || (customerPhone && !customer.phone) || (customerCompany && !customer.companyName)) {
                await prisma.customer.update({
                    where: { id: customer.id },
                    data: {
                        email: customerEmail || customer.email,
                        phone: customerPhone || customer.phone,
                        companyName: customerCompany || customer.companyName
                    }
                });
            }
        }

        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerName,
                customerCompany: customerCompany || null,
                customerEmail,
                customerPhone,
                total: Number(total || 0),
                status: status || 'LEAD',
                items: items || [],
                quoteId: quoteId || null,
                customerId: customer.id
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
