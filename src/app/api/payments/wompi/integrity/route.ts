import { NextResponse } from 'next/server';
import { generateIntegritySignature, toCents } from '@/lib/wompi';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, reference } = body;

        if (!amount || !reference) {
            return NextResponse.json({ error: 'Monto y referencia son obligatorios' }, { status: 400 });
        }

        const amountInCents = toCents(amount);
        const signature = generateIntegritySignature(reference, amountInCents, 'COP');

        return NextResponse.json({
            signature,
            amountInCents,
            currency: 'COP',
            publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'pub_test_Q5yDA9xoKdePzhS8qn96MpSyo98UvSly'
        });
    } catch (error) {
        console.error('Error generating Wompi signature:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
