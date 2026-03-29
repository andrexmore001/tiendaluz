"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import { Collection, Product } from '@/types/product';
import { getOptimizedUrl } from '@/lib/cloudinary';
import styles from './CategoryCarousel.module.css';

interface CategoryCarouselProps {
  collections: Collection[];
  products: Product[];
  title?: string;
}

export default function CategoryCarousel({ collections, products, title }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Solo mostraremos categorías que tengan al menos un producto para extraer su imagen.
  const collectionsWithImages = collections.map(collection => {
    // Buscar el primer producto que pertenezca a esta colección
    const firstProduct = products.find(p => p.category === collection.id);
    return {
      ...collection,
      coverImage: firstProduct?.image || null
    };
  }).filter(c => c.coverImage !== null); // Ocultar si está vacía

  if (collectionsWithImages.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      {title && (
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>{title}</h2>
        </div>
      )}
      <div className={styles.carouselContainer}>
        <button 
          className={`${styles.scrollBtn} ${styles.scrollLeft}`} 
          onClick={() => handleScroll('left')}
          aria-label="Desplazar a la izquierda"
        >
          &#10094;
        </button>
        <div className={styles.scrollArea} ref={scrollRef}>
          {collectionsWithImages.map((collection) => (
          <Link 
            key={collection.id} 
            href={`/productos?coleccion=${collection.id}`} 
            className={styles.storyLink}
          >
            <div className={styles.imageRing}>
              <div className={styles.imageWrapper}>
                <img 
                  src={collection.coverImage ? getOptimizedUrl(collection.coverImage, 150) : '/placeholder.png'} 
                  alt={collection.name} 
                  loading="lazy"
                  className={styles.storyImage}
                />
              </div>
            </div>
            <span className={styles.storyName}>{collection.name}</span>
          </Link>
        ))}
        </div>
        <button 
          className={`${styles.scrollBtn} ${styles.scrollRight}`} 
          onClick={() => handleScroll('right')}
          aria-label="Desplazar a la derecha"
        >
          &#10095;
        </button>
      </div>
    </div>
  );
}
