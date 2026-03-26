import { Metadata } from 'next';
import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import ProductosClient from './ProductosClient';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const params = await searchParams;
    const catId = params.cat_id as string;
    const subId = params.sub_id as string;
    
    let title = 'Nuestras Colecciones | Artesana';
    let description = 'Explora nuestras cajas personalizadas y regalos especiales. Detalles hechos con amor para cada historia.';

    if (subId || catId) {
        const categoryId = subId || catId;
        const category = await prisma.collection.findUnique({
            where: { id: categoryId }
        });
        
        if (category) {
            title = `${category.name} | Colecciones Artesana`;
            if (category.description) {
                description = category.description;
            } else {
                description = `Descubre nuestra colección de ${category.name} en Artesana. Cajas personalizadas únicas.`;
            }
        }
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
        }
    };
}

export default function ProductosPage() {
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
