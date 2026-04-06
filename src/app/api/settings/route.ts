import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Recache every hour

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

        return new NextResponse(JSON.stringify(settings), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=0, s-maxage=1, stale-while-revalidate=59, must-revalidate',
            },
        });
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
                logo: rest?.logo,
                primaryColor: colors?.primary,
                secondaryColor: colors?.secondary,
                accentColor: colors?.accent,
                backgroundColor: colors?.background,
                phone: contact?.phone,
                email: contact?.email,
                address: contact?.address,
                instagram: contact?.instagram,
                facebook: contact?.facebook,
                heroTitle: rest?.heroTitle,
                heroSubtitle: rest?.heroSubtitle,
                heroImages: rest?.heroImages || [],
                chatBusinessId: rest?.chatBusinessId,
                chatApiKey: rest?.chatApiKey,
                tickerMessage: rest?.tickerMessage,
                tickerVisible: rest?.tickerVisible,
                tickerSpeed: rest?.tickerSpeed,
                tickerColor: rest?.tickerColor,
                reviews: rest?.reviews || [],
                homepageLayout: rest?.homepageLayout || ['categories', 'hero', 'split-hero', 'features', 'products', 'reviews'],
            },
            create: {
                id: 'site-settings',
                ...rest,
                logo: rest?.logo,
                primaryColor: colors?.primary,
                secondaryColor: colors?.secondary,
                accentColor: colors?.accent,
                backgroundColor: colors?.background,
                phone: contact?.phone,
                email: contact?.email,
                address: contact?.address,
                instagram: contact?.instagram,
                facebook: contact?.facebook,
                heroTitle: rest?.heroTitle,
                heroSubtitle: rest?.heroSubtitle,
                heroImages: rest?.heroImages || [],
                chatBusinessId: rest?.chatBusinessId,
                chatApiKey: rest?.chatApiKey,
                tickerMessage: rest?.tickerMessage,
                tickerVisible: rest?.tickerVisible,
                tickerSpeed: rest?.tickerSpeed,
                tickerColor: rest?.tickerColor,
                reviews: rest?.reviews || [],
                homepageLayout: rest?.homepageLayout || ['categories', 'hero', 'split-hero', 'features', 'products', 'reviews'],
            },
        });

        revalidatePath('/api/settings');
        revalidatePath('/api/bootstrap');
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Error al guardar configuraciones' }, { status: 500 });
    }
}
