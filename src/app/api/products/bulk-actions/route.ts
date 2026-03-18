import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { productIds, action } = await req.json();

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
        }

        if (action === 'delete') {
            await prisma.product.deleteMany({
                where: { id: { in: productIds } }
            });
        } else if (action === 'hide') {
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { isVisible: false }
            });
        } else if (action === 'show') {
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { isVisible: true }
            });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        revalidatePath('/api/products');
        revalidatePath('/api/bootstrap');

        return NextResponse.json({ success: true, message: `Action ${action} completed successfully` });
    } catch (error: any) {
        console.error('Error in bulk actions:', error);
        return NextResponse.json({ error: 'Error processing bulk action: ' + error.message }, { status: 500 });
    }
}
