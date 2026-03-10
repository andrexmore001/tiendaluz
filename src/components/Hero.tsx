import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import { getOptimizedUrl } from '@/lib/cloudinary';
import styles from './Hero.module.css';

import Image from 'next/image';

export default function Hero() {
    const { settings } = useSettings();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const title = settings.heroTitle || 'Creamos cajas que cuentan historias';
    const subtitle = settings.heroSubtitle || 'Regalos personalizados hechos con amor, diseñados para emocionar y perdurar en el corazón.';
    const images = settings.heroImages && settings.heroImages.filter(img => !!img).length > 0
        ? settings.heroImages.filter(img => !!img)
        : ['/hero-banner.png'];

    const firstImage = images[0];

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section className={styles.hero}>
            {images.map((img, idx) => (
                <div
                    key={idx}
                    className={styles.heroSlide}
                    style={{
                        opacity: idx === currentImageIndex ? 1 : 0,
                        transition: 'opacity 1s ease-in-out'
                    }}
                >
                    <Image
                        src={getOptimizedUrl(img, 1200)}
                        alt={`Hero background ${idx}`}
                        fill
                        priority={idx === 0}
                        style={{ objectFit: 'cover' }}
                        sizes="100vw"
                    />
                </div>
            ))}
            <div className={styles.overlay}></div>
            <div className={`${styles.content} container`}>
                <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: title.replace('\n', '<br />') }}>
                </h1>
                <p className={styles.subtitle}>
                    {subtitle}
                </p>
                <div className={styles.ctaGroup}>
                    <Link href="/personalizar" className="btn-primary">
                        Diseñar mi caja
                    </Link>
                    <Link href="/productos" className={styles.secondaryBtn}>
                        Ver Colecciones
                    </Link>
                </div>
            </div>
        </section>
    );
}
