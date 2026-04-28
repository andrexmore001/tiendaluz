import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    try {
        const customers = await prisma.customer.findMany({
            where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
            include: {
                _count: { select: { quotes: true, orders: true } },
                quotes: { select: { total: true }, orderBy: { createdAt: 'desc' } },
                orders: { select: { total: true, status: true }, orderBy: { createdAt: 'desc' } }
            },
            orderBy: { name: 'asc' }
        });

        const result = customers.map(c => ({
            ...c,
            totalValue: c.quotes.reduce((s, q) => s + q.total, 0),
            quotesCount: c._count.quotes,
            ordersCount: c._count.orders,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await req.json();
        const customer = await prisma.customer.create({ data });
        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
    }
}
