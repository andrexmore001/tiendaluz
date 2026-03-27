import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import CustomizerClient from './CustomizerClient';
import { getOptimizedUrl } from '@/lib/cloudinary';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Try finding by slug first, then by ID
  let product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    product = await prisma.product.findUnique({
      where: { id: slug },
    });
  }

  if (!product) {
    return {
      title: 'Producto no encontrado | Artesana',
    };
  }

  const title = `${product.name} | Cajas Personalizadas Artesana`;
  const description = product.description || `Personaliza tu ${product.name} en Artesana. Detalles hechos con amor para cada momento especial.`;
  const imageUrl = getOptimizedUrl(product.image, 1200);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CustomizerSlugPage({ params }: Props) {
  const { slug } = await params;
  
  // Try finding by slug first
  let product = await prisma.product.findUnique({
    where: { slug },
  });

  // Fallback to ID if not found by slug
  if (!product) {
    product = await prisma.product.findUnique({
      where: { id: slug },
    });

    // If found by ID and it HAS a slug, redirect to the clean URL
    if (product?.slug) {
      redirect(`/personalizar/${product.slug}`);
    }
  }

  if (!product) {
      return (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>Producto no encontrado</p>
          </div>
      );
  }

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": getOptimizedUrl(product.image, 800),
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "COP",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CustomizerClient id={product.id} />
    </>
  );
}
