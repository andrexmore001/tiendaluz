import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductosClient from './ProductosClient';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Nuestros Productos | Artesana',
        description: 'Explora nuestras cajas personalizadas y regalos especiales. Detalles hechos con amor para cada historia.',
    };
}

export default async function ProductosPage({ searchParams }: Props) {
    const params = await searchParams;
    const catId = params.cat_id as string;
    const subId = params.sub_id as string;

    // Redirección SEO de parámetros legacy (?cat_id=...) a rutas limpias (/productos/slug)
    if (subId || catId) {
        const categoryId = subId || catId;
        console.log(`[DEBUG] Attempting redirect for categoryId: ${categoryId}`);
        const category = await prisma.collection.findUnique({
            where: { id: categoryId as string }
        }) as any;
        
        console.log(`[DEBUG] Found category: ${category?.name}, slug: ${category?.slug}`);
        
        if (category?.slug) {
            console.log(`[DEBUG] Redirecting to /productos/${category.slug}`);
            redirect(`/productos/${category.slug}`);
        } else {
            console.warn(`[DEBUG] No slug found for category ${categoryId}, redirect skipped.`);
        }
    }

    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Cargando productos...</p>
            </div>
        }>
            <ProductosClient />
        </Suspense>
    );
}
