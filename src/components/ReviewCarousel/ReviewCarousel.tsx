"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
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
    const [activeIndex, setActiveIndex] = useState(0);
    const [activePhraseIndex, setActivePhraseIndex] = useState(0);

    // Combina la Portada, las Reseñas y el CTA Final en un solo array circular
    const items = [
        { type: 'cover' },
        ...reviews.map(url => ({ type: 'review', url })),
        { type: 'cta' }
    ];

    // Rotación automática de las frases flotantes
    useEffect(() => {
        const interval = setInterval(() => {
            setActivePhraseIndex((prev) => (prev + 1) % PHRASES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Autoplay del carrusel 3D
    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 5000); // 5 segundos para que de tiempo a leer
        return () => clearInterval(interval);
    }, [activeIndex, items.length]);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const handleCardClick = (index: number) => {
        setActiveIndex(index);
    };

    const getCardClass = (index: number) => {
        if (index === activeIndex) return styles.active;
        if (index === (activeIndex - 1 + items.length) % items.length) return styles.prev;
        if (index === (activeIndex + 1) % items.length) return styles.next;
        
        // Lógica de tarjetas lejanas ocultas
        const diffForward = (index - activeIndex + items.length) % items.length;
        const diffBackward = (activeIndex - index + items.length) % items.length;
        
        if (diffForward < diffBackward) {
            return styles.nextHidden;
        } else {
            return styles.prevHidden;
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
                    {/* El Mockup de iPhone estático en el centro */}
                    <div className={styles.iphoneFrame}>
                        <div className={styles.dynamicIsland}></div>
                    </div>

                    {/* Las tarjetas 3D flotantes */}
                    {items.map((item, index) => (
                        <div 
                            key={index} 
                            className={`${styles.card} ${getCardClass(index)}`}
                            onClick={() => handleCardClick(index)}
                        >
                            {item.type === 'cover' && (
                                <div className={styles.coverSlide}>
                                    <Star fill="white" size={48} style={{ marginBottom: '1.5rem' }} />
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2 }}>
                                        Nuestros clientes lo confirman 👇
                                    </h3>
                                </div>
                            )}

                            {item.type === 'review' && (
                                <img 
                                    src={getOptimizedUrl(item.url!, 600) || item.url} 
                                    alt={`Reseña ${index}`} 
                                    className={styles.reviewImage}
                                    loading="lazy"
                                />
                            )}

                            {item.type === 'cta' && (
                                <div className={styles.ctaSlide}>
                                    <ShoppingCart size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
                                    <p style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--text-main)', marginTop: '1rem', lineHeight: 1.2 }}>
                                        Vive la experiencia Artessana
                                    </p>
                                    <Link href="/productos" className={styles.ctaBtn}>
                                        🛒 Haz tu pedido hoy
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.controls}>
                    <button 
                        className={styles.controlBtn} 
                        onClick={handlePrev} 
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        className={styles.controlBtn} 
                        onClick={handleNext} 
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ReviewCarousel;
