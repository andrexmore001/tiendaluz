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
        return NextResponse.json(quotes);
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

        // Upsert by quoteNumber to prevent duplicates or allow updates
        const quote = await prisma.quote.upsert({
            where: { quoteNumber },
            update: {
                date,
                expiryDate,
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
                date,
                expiryDate,
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

        return NextResponse.json(quote);
    } catch (error) {
        console.error('Error saving quote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
