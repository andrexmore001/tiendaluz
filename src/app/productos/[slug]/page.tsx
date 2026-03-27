import { Metadata } from 'next';
import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import ProductosClient from '../ProductosClient';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    
    let title = 'Nuestras Colecciones | Artesana';
    let description = 'Explora nuestras cajas personalizadas y regalos especiales. Detalles hechos con amor para cada historia.';

    const category = await prisma.collection.findUnique({
        where: { slug }
    });
    
    if (category) {
        title = `${category.name} | Colecciones Artesana`;
        if (category.description) {
            description = category.description;
        } else {
            description = `Descubre nuestra colección de ${category.name} en Artesana. Cajas personalizadas únicas.`;
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

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Cargando colección...</p>
            </div>
        }>
            <ProductosClient categorySlug={slug} />
        </Suspense>
    );
}
