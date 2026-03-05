import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        let settings = await prisma.setting.findFirst();

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.setting.create({
                data: {
                    id: 'site-settings',
                    title: 'Artesana',
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Error al obtener configuraciones' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { colors, contact, ...rest } = data;

        const settings = await prisma.setting.upsert({
            where: { id: 'site-settings' },
            update: {
                ...rest,
                primaryColor: colors?.primary,
                secondaryColor: colors?.secondary,
                accentColor: colors?.accent,
                backgroundColor: colors?.background,
                phone: contact?.phone,
                email: contact?.email,
                address: contact?.address,
                instagram: contact?.instagram,
                facebook: contact?.facebook,
            },
            create: {
                id: 'site-settings',
                ...rest,
                primaryColor: colors?.primary,
                secondaryColor: colors?.secondary,
                accentColor: colors?.accent,
                backgroundColor: colors?.background,
                phone: contact?.phone,
                email: contact?.email,
                address: contact?.address,
                instagram: contact?.instagram,
                facebook: contact?.facebook,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Error al guardar configuraciones' }, { status: 500 });
    }
}
