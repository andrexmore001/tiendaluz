"use client";
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import styles from './ReviewCarousel.module.css';
import { getOptimizedUrl } from '@/lib/cloudinary';

interface ReviewCarouselProps {
    reviews: string[];
}

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [reviews]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                if (scrollLeft >= scrollWidth - clientWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scroll('right');
                }
            }
        }, 4000); // Cambio cada 4 segundos
        return () => clearInterval(interval);
    }, [reviews]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const isMobile = window.innerWidth <= 768;
            const cardWidth = isMobile ? 160 : 210;
            const gap = 16;
            const scrollAmount = cardWidth + gap;
            
            const newScrollLeft = direction === 'left' 
                ? scrollRef.current.scrollLeft - scrollAmount 
                : scrollRef.current.scrollLeft + scrollAmount;
            
            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
            
            setTimeout(checkScroll, 500);
        }
    };

    if (!reviews || reviews.length === 0) return null;

    return (
        <section className={styles.section} id="reviews">
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '50%', display: 'flex' }}>
                            <Quote size={24} />
                        </div>
                    </div>
                    <h2 className={styles.title}>Lo que dicen nuestros clientes</h2>
                    <p className={styles.subtitle}>
                        Cada historia de éxito nos motiva a seguir creando experiencias inolvidables.
                    </p>
                </div>

                <div className={styles.carouselContainer}>
                    <div 
                        className={styles.carouselTrack} 
                        ref={scrollRef} 
                        onScroll={checkScroll}
                        style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {reviews.map((url, index) => (
                            <div key={index} className={styles.reviewCard}>
                                <img 
                                    src={getOptimizedUrl(url, 600) || url} 
                                    alt={`Reseña ${index + 1}`} 
                                    className={styles.reviewImage}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>

                    <div className={styles.controls}>
                        <button 
                            className={styles.controlBtn} 
                            onClick={() => scroll('left')} 
                            disabled={!canScrollLeft}
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            className={styles.controlBtn} 
                            onClick={() => scroll('right')} 
                            disabled={!canScrollRight}
                            aria-label="Siguiente"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReviewCarousel;
