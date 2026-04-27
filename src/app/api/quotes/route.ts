import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const quotes = await prisma.quote.findMany({
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });

        // Format dates back to DD/MM/YYYY for the frontend
        const formattedQuotes = quotes.map(q => ({
            ...q,
            date: q.date ? new Date(q.date).toLocaleDateString('es-ES') : '',
            expiryDate: q.expiryDate ? new Date(q.expiryDate).toLocaleDateString('es-ES') : ''
        }));

        return NextResponse.json(formattedQuotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const {
            quoteNumber,
            date,
            expiryDate,
            vendor,
            clientName,
            clientNit,
            billingAddress,
            shippingAddress,
            items,
            notes,
            paymentTerms,
            subtotal,
            total
        } = body;

        const parseDate = (dateStr: string) => {
            if (!dateStr) return null;
            if (dateStr.includes('/')) {
                const [day, month, year] = dateStr.split('/');
                return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`);
            }
            return new Date(dateStr);
        };

        const parsedDate = parseDate(date) || new Date();
        const parsedExpiryDate = parseDate(expiryDate);

        const quote = await prisma.quote.upsert({
            where: { quoteNumber },
            update: {
                date: parsedDate,
                expiryDate: parsedExpiryDate,
                vendor,
                clientName,
                clientNit,
                billingAddress,
                shippingAddress,
                notes,
                paymentTerms,
                subtotal,
                total,
                items: {
                    deleteMany: {},
                    create: items.map((item: any) => ({
                        description: item.description,
                        qty: item.qty,
                        unitPrice: item.unitPrice
                    }))
                }
            },
            create: {
                quoteNumber,
                date: parsedDate,
                expiryDate: parsedExpiryDate,
                vendor,
                clientName,
                clientNit,
                billingAddress,
                shippingAddress,
                notes,
                paymentTerms,
                subtotal,
                total,
                items: {
                    create: items.map((item: any) => ({
                        description: item.description,
                        qty: item.qty,
                        unitPrice: item.unitPrice
                    }))
                }
            }
        });

        // Ensure Order exists for this Quote
        const orderData = {
            orderNumber: `ORD-${quote.quoteNumber}`,
            customerName: quote.clientName,
            total: quote.total,
            items: items.map((i: any) => ({ name: i.description, qty: i.qty, price: i.unitPrice })),
            status: 'QUOTE'
        };

        await prisma.order.upsert({
            where: { quoteId: quote.id },
            update: {
                total: orderData.total,
                customerName: orderData.customerName,
                items: orderData.items
            },
            create: {
                ...orderData,
                quoteId: quote.id
            }
        });

        return NextResponse.json(quote);
    } catch (error) {
        console.error('Error saving quote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const quoteNumber = searchParams.get('quoteNumber');

        if (!quoteNumber) {
            return NextResponse.json({ error: 'Quote number is required' }, { status: 400 });
        }

        await prisma.quoteItem.deleteMany({
            where: { quote: { quoteNumber } }
        });

        await prisma.quote.delete({
            where: { quoteNumber }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting quote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
