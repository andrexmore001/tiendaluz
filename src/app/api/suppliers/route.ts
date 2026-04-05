import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Recache every hour

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' }
        });
        return new NextResponse(JSON.stringify(suppliers), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching suppliers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { id, ...rest } = data;

        const supplier = await prisma.supplier.upsert({
            where: { id: id || 'new' },
            update: rest,
            create: { ...rest, id: id || undefined },
        });

        revalidatePath('/api/suppliers');
        revalidatePath('/api/bootstrap');
        return NextResponse.json(supplier);
    } catch (error) {
        return NextResponse.json({ error: 'Error saving supplier' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID de proveedor requerido' }, { status: 400 });
        }

        await prisma.supplier.delete({
            where: { id },
        });

        revalidatePath('/api/suppliers');
        revalidatePath('/api/bootstrap');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        return NextResponse.json({ error: 'Error al eliminar proveedor' }, { status: 500 });
    }
}
