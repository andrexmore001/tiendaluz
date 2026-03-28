import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const attributes = await prisma.attribute.findMany({
            include: {
                values: true
            }
        });
        return NextResponse.json(attributes);
    } catch (error) {
        console.error('Error fetching attributes:', error);
        return NextResponse.json({ error: 'Error al obtener atributos' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { id, name, values } = data; // values array of strings or objects

        if (!name) {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        let attribute;

        const connectValues = values?.map((v: any) => ({ value: v.value || v })) || [];

        // It is an update
        if (id && !id.startsWith('attr_')) {
            // Eliminar valores antiguos (esto requeriría un borrado de cascada o manual)
            await prisma.attributeValue.deleteMany({
                where: { attributeId: id }
            });

            attribute = await prisma.attribute.update({
                where: { id },
                data: {
                    name,
                    values: {
                        create: connectValues
                    }
                },
                include: { values: true }
            });
        } else {
            // It is a creation
            attribute = await prisma.attribute.create({
                data: {
                    name,
                    values: {
                        create: connectValues
                    }
                },
                include: { values: true }
            });
        }

        revalidatePath('/api/products');
        revalidatePath('/admin');
        return NextResponse.json(attribute, { status: 200 });
    } catch (error: any) {
        console.error('Error saving attribute:', error);
        return NextResponse.json({ error: error.message || 'Error al guardar atributo' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        await prisma.attribute.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting attribute:', error);
        return NextResponse.json({ error: 'Error al eliminar atributo' }, { status: 500 });
    }
}
