import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                quotes: {
                    include: { items: true },
                    orderBy: { createdAt: 'desc' }
                },
                orders: {
                    include: { notes: { orderBy: { createdAt: 'desc' } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!customer) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json({ error: 'Error al obtener cliente' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        const body = await req.json();
        const { 
            name, 
            companyName, 
            nit, 
            phone, 
            email, 
            billingAddress, 
            shippingAddress, 
            notes 
        } = body;

        const customer = await prisma.customer.update({ 
            where: { id }, 
            data: {
                name,
                companyName,
                nit,
                phone,
                email,
                billingAddress,
                shippingAddress,
                notes
            } 
        });
        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        await prisma.customer.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 });
    }
}
