import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { syncAllProductsToVentiq } from '@/lib/ventiqSync';

/**
 * POST /api/products/sync
 *
 * Endpoint interno (requiere sesión de admin).
 * Sincroniza TODO el catálogo de Artesana con Ventiq de una vez.
 * Llamado desde el botón "Sincronizar catálogo" en el admin.
 */
export async function POST() {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const result = await syncAllProductsToVentiq();
        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        console.error('[VentiqSync] Error en sync masivo:', error);
        return NextResponse.json(
            { error: error.message || 'Error al sincronizar con el chatbot' },
            { status: 500 }
        );
    }
}
