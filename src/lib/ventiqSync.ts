import prisma from '@/lib/prisma';

/**
 * Mapea un producto de Artesana al formato que espera Ventiq
 */
function mapToVentiqProduct(p: any) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artessana.vercel.app';
    return {
        name: p.name,
        description: p.description || '',
        price: Number(p.price) || 0,
        category: p.collection?.name || p.collectionName || null,
        imageUrl: p.image || (Array.isArray(p.images) && p.images[0]) || null,
        url: p.slug ? `${baseUrl}/personalizar/${p.slug}` : null,
        isActive: p.isVisible !== false,
    };
}

/**
 * Obtiene la configuración del chatbot desde la DB
 */
async function getChatConfig() {
    const settings = await prisma.setting.findFirst({
        select: { chatApiKey: true, chatSyncUrl: true },
    });

    if (!settings?.chatApiKey || !settings?.chatSyncUrl) {
        return null;
    }

    return {
        apiKey: settings.chatApiKey,
        syncUrl: settings.chatSyncUrl.replace(/\/$/, ''), // quitar slash final
    };
}

/**
 * Sincroniza UN producto con Ventiq (al guardar o eliminar desde el admin).
 * Es fire-and-forget: no bloquea la respuesta de Artesana.
 *
 * @param product - Producto de Artesana (con relaciones incluidas)
 * @param action  - 'upsert' al crear/editar, 'delete' al eliminar
 */
export async function syncProductToVentiq(product: any, action: 'upsert' | 'delete'): Promise<void> {
    const config = await getChatConfig();
    if (!config) {
        console.warn('[VentiqSync] No configurado (falta chatApiKey o chatSyncUrl)');
        return;
    }

    const payload =
        action === 'delete'
            ? {
                  action: 'delete',
                  product: {
                      url: product.slug
                          ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://artessana.vercel.app'}/personalizar/${product.slug}`
                          : null,
                  },
              }
            : {
                  action: 'upsert',
                  product: mapToVentiqProduct(product),
              };

    const res = await fetch(`${config.syncUrl}/api/products/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ventiq respondió ${res.status}: ${text}`);
    }
}

/**
 * Sincroniza TODO el catálogo de Artesana con Ventiq de una sola vez.
 * Usado por el botón "Sincronizar catálogo" del admin.
 *
 * @returns { synced, errors }
 */
export async function syncAllProductsToVentiq(): Promise<{ synced: number; errors: number }> {
    const config = await getChatConfig();
    if (!config) {
        throw new Error('Chatbot no configurado. Verifica chatApiKey y chatSyncUrl en Settings.');
    }

    // Traer todos los productos visibles con sus colecciones
    const products = await prisma.product.findMany({
        where: { isVisible: true },
        include: {
            collection: { select: { name: true } },
        },
    });

    const mapped = products.map((p: any) => mapToVentiqProduct({
        ...p,
        collectionName: p.collection?.name,
    }));

    const res = await fetch(`${config.syncUrl}/api/products/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
        },
        body: JSON.stringify({ action: 'full_sync', products: mapped }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ventiq respondió ${res.status}: ${text}`);
    }

    const data = await res.json();
    return { synced: data.synced ?? products.length, errors: 0 };
}
