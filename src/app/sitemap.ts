import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // 1. Static Routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  // 2. Dynamic Collection Routes
  const collections = await prisma.collection.findMany({
    select: { id: true, createdAt: true },
  });

  const collectionRoutes = collections.map((col) => ({
    url: `${baseUrl}/productos?cat_id=${col.id}`,
    lastModified: col.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Dynamic Product Routes
  const products = await prisma.product.findMany({
    where: { isVisible: true },
    select: { id: true, updatedAt: true },
  });

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/personalizar/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
