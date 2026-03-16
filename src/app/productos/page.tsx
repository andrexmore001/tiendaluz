"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSettings } from '@/context/SettingsContext';
import { getOptimizedUrl } from '@/lib/cloudinary';
import Link from 'next/link';
import styles from './productos.module.css';

export default function ProductosPage() {
    const { products, collections } = useSettings();
    const [activeCollection, setActiveCollection] = useState("Todas");

    const filteredProducts = activeCollection === "Todas"
        ? products
        : products.filter(p => p.category === activeCollection);

    return (
        <main>
            <Navbar />
            <section className="section-padding container">
                <header className={styles.header}>
                    <h1>Nuestras Colecciones</h1>
                    <p>Explora nuestras creaciones diseñadas para cada historia especial.</p>
                </header>

                {/* Collections Filter Navigation */}
                <nav className={styles.collectionNav}>
                    <button
                        className={`${styles.colBtn} ${activeCollection === "Todas" ? styles.colBtnActive : ''}`}
                        onClick={() => setActiveCollection("Todas")}
                    >
                        Todas
                    </button>
                    {collections.map(col => (
                        <button
                            key={col.id}
                            className={`${styles.colBtn} ${activeCollection === col.name ? styles.colBtnActive : ''}`}
                            onClick={() => setActiveCollection(col.name)}
                        >
                            {col.name}
                        </button>
                    ))}
                </nav>

                <div className={styles.grid}>
                    {filteredProducts.map(product => (
                        <Link key={product.id} href={`/personalizar/${product.id}`} className={styles.card} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                            <div className={styles.imageBox}>
                                <img src={getOptimizedUrl(product.image, 600) || '/placeholder.png'} alt={product.name} />
                            </div>
                            <div className={styles.info}>
                                <span className={styles.category}>{product.category}</span>
                                <h3>{product.name}</h3>
                                <p className={styles.price}>${product.price.toLocaleString()}</p>
                                <span className={styles.productBtn}>
                                    Añadir al carrito
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>Próximamente tendremos nuevas piezas en esta colección.</p>
                    </div>
                )}
            </section>
            <Footer />
        </main>
    );
}
