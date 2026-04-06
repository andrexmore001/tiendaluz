"use client";
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, ShoppingCart, Star } from 'lucide-react';
import styles from './ReviewCarousel.module.css';
import { getOptimizedUrl } from '@/lib/cloudinary';
import Link from 'next/link';

interface ReviewCarouselProps {
    reviews: string[];
}

const PHRASES = [
    "Esto nos hace felices 🥹",
    "Clientes reales, opiniones reales",
    "Lo que no te contamos… te lo cuentan ellos"
];

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [activePhraseIndex, setActivePhraseIndex] = useState(0);

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

    // Rotación de frases
    useEffect(() => {
        const interval = setInterval(() => {
            setActivePhraseIndex((prev) => (prev + 1) % PHRASES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

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
        }, 5000); // Un poco más lento para permitir lectura
        return () => clearInterval(interval);
    }, [reviews]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const isMobile = window.innerWidth <= 768;
            const scrollAmount = isMobile ? 160 : 200;
            
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
                    <h2 className={styles.title}>Voces de nuestra comunidad</h2>
                    <div className={styles.floatingPhrases}>
                        {PHRASES.map((phrase, idx) => (
                            <span 
                                key={idx} 
                                className={`${styles.phrase} ${activePhraseIndex === idx ? styles.phraseActive : ''}`}
                            >
                                {phrase}
                            </span>
                        ))}
                    </div>
                </div>

                <div className={styles.carouselContainer}>
                    <div 
                        className={styles.carouselTrack} 
                        ref={scrollRef} 
                        onScroll={checkScroll}
                        style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Slide de Portada */}
                        <div className={styles.coverCard}>
                            <Star fill="white" size={32} style={{ marginBottom: '1rem' }} />
                            <h3>Nuestros clientes lo confirman 👇</h3>
                        </div>

                        {/* Slides de Reseñas */}
                        {reviews.map((url, index) => (
                            <div key={index} className={styles.reviewCard}>
                                <img 
                                    src={getOptimizedUrl(url, 400) || url} 
                                    alt={`Reseña ${index + 1}`} 
                                    className={styles.reviewImage}
                                    loading="lazy"
                                />
                            </div>
                        ))}

                        {/* Slide de CTA Final */}
                        <div className={styles.ctaCard}>
                            <ShoppingCart size={40} color="var(--primary)" />
                            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                Vive la experiencia Tienda Luz
                            </p>
                            <Link href="/productos" className={styles.ctaBtn}>
                                🛒 Haz tu pedido hoy
                            </Link>
                        </div>
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
