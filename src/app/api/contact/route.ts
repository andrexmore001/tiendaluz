import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const messages = await prisma.contactMessage.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        return NextResponse.json({ error: 'Error al cargar los mensajes' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
        }

        // Save message to database
        const newMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                message
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.',
            id: newMessage.id
        });

    } catch (error: any) {
        console.error('Error in contact API:', error);
        return NextResponse.json({
            error: 'Ocurrió un error al enviar el mensaje. Por favor intenta de nuevo.'
        }, { status: 500 });
    }
}
