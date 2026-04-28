import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// POST /api/customers/migrate
// Creates Customer records from existing Quote clientName data
// and links them back via customerId
export async function POST() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const quotes = await prisma.quote.findMany({
            where: { customerId: null },
            orderBy: { createdAt: 'asc' }
        });

        let created = 0;
        let linked = 0;

        // Group quotes by clientName (case-insensitive)
        const byName: Record<string, typeof quotes> = {};
        for (const q of quotes) {
            const key = q.clientName.trim().toLowerCase();
            if (!byName[key]) byName[key] = [];
            byName[key].push(q);
        }

        for (const [, group] of Object.entries(byName)) {
            const first = group[0];

            // Check if customer already exists by name (case-insensitive)
            let customer = await prisma.customer.findFirst({
                where: { name: { equals: first.clientName.trim(), mode: 'insensitive' } }
            });

            if (!customer) {
                customer = await prisma.customer.create({
                    data: {
                        name: first.clientName.trim(),
                        nit: first.clientNit || null,
                        billingAddress: first.billingAddress || null,
                        shippingAddress: first.shippingAddress || null,
                    }
                });
                created++;
            }

            // Link all quotes and their orders to this customer
            for (const q of group) {
                await prisma.quote.update({
                    where: { id: q.id },
                    data: { customerId: customer.id }
                });

                // Also link the related order if it exists
                const order = await prisma.order.findFirst({ where: { quoteId: q.id } });
                if (order && !order.customerId) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: {
                            customerId: customer.id,
                            customerEmail: customer.email ?? undefined,
                            customerPhone: customer.phone ?? undefined,
                        }
                    });
                }
                linked++;
            }
        }

        return NextResponse.json({ success: true, created, linked, message: `${created} clientes creados, ${linked} registros vinculados` });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Error en migración' }, { status: 500 });
    }
}
