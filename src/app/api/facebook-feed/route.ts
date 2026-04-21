import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Este endpoint genera un feed XML compatible con Facebook Commerce Manager
// Facebook lo consultará automáticamente cada vez que quieras refrescar el catálogo
// URL pública: https://tu-dominio.com/api/facebook-feed

export const revalidate = 3600; // Refrescar caché cada hora

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { isVisible: true },
            include: {
                priceTiers: { orderBy: { minQty: 'asc' } },
                collection: { select: { name: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://artesana.com.co';

        const items = products.map((product: any) => {
            // Precio: si hay tiers, usar el precio del primer tier (menor cantidad), si no el precio base
            const price = product.priceTiers?.length > 0
                ? product.priceTiers[0].unitPrice
                : product.price;

            // Construir lista de imágenes adicionales
            const additionalImages: string[] = Array.isArray(product.images)
                ? product.images.filter((img: string) => img && img !== product.image).slice(0, 9)
                : [];

            const additionalImgTags = additionalImages
                .map((img: string) => `<additional_image_link>${escapeXml(img)}</additional_image_link>`)
                .join('\n            ');

            return `
        <item>
            <id>${escapeXml(product.id)}</id>
            <title>${escapeXml(product.name)}</title>
            <description>${escapeXml(product.description || product.name)}</description>
            <availability>in stock</availability>
            <condition>new</condition>
            <price>${formatPrice(price)} COP</price>
            <link>${baseUrl}/productos/${escapeXml(product.slug)}</link>
            <image_link>${escapeXml(product.image || '')}</image_link>
            ${additionalImgTags}
            <brand>Artesana</brand>
            ${product.collection?.name ? `<product_type>${escapeXml(product.collection.name)}</product_type>` : ''}
            <google_product_category>5181</google_product_category>
        </item>`;
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
    <channel>
        <title>Artesana - Catálogo de Productos</title>
        <link>${baseUrl}</link>
        <description>Catálogo de productos artesanales de Artesana Colombia</description>
        ${items.join('\n')}
    </channel>
</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('[FacebookFeed] Error generando feed:', error);
        return NextResponse.json({ error: 'Error al generar el feed' }, { status: 500 });
    }
}

// Utilidades
function escapeXml(str: string): string {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function formatPrice(price: number): string {
    return Number(price).toFixed(2);
}
