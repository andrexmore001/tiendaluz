"use client";
import React, { useRef, useState, useEffect } from 'react';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll(); // Comprobar en el montaje
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [collections]); // Recomprobar si cambian las colecciones

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      // El timeout es para darle tiempo al scroll suave de avanzar antes de re-evaluar si ocultamos los botones
      setTimeout(checkScroll, 350);
    }
  };

  // Solo mostraremos categorías que tengan al menos un producto para extraer su imagen.
  const collectionsWithImages = collections.map(collection => {
    // Buscar el primer producto que pertenezca a esta colección
    const firstProduct = products.find(p => p.collectionId === collection.id);
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
        {canScrollLeft && (
          <button 
            className={`${styles.scrollBtn} ${styles.scrollLeft}`} 
            onClick={() => handleScroll('left')}
            aria-label="Desplazar a la izquierda"
          >
            &#10094;
          </button>
        )}
        <div 
          className={styles.scrollArea} 
          ref={scrollRef}
          onScroll={checkScroll}
        >
          {collectionsWithImages.map((collection) => (
          <Link 
            key={collection.id} 
            href={`/productos/${collection.slug || collection.id}`} 
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
        {canScrollRight && (
          <button 
            className={`${styles.scrollBtn} ${styles.scrollRight}`} 
            onClick={() => handleScroll('right')}
            aria-label="Desplazar a la derecha"
          >
            &#10095;
          </button>
        )}
      </div>
    </div>
  );
}
