"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSettings } from '@/context/SettingsContext';
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
                    {collections.map(col => (
                        <button
                            key={col}
                            className={`${styles.colBtn} ${activeCollection === col ? styles.colBtnActive : ''}`}
                            onClick={() => setActiveCollection(col)}
                        >
                            {col}
                        </button>
                    ))}
                </nav>

                <div className={styles.grid}>
                    {filteredProducts.map(product => (
                        <div key={product.id} className={styles.card}>
                            <div className={styles.imageBox}>
                                <img src={product.image} alt={product.name} />
                            </div>
                            <div className={styles.info}>
                                <span className={styles.category}>{product.category}</span>
                                <h3>{product.name}</h3>
                                <p className={styles.price}>${product.price.toLocaleString()}</p>
                                <Link href={`/personalizar/${product.id}`} className="btn-primary" style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                                    Elegir y Personalizar
                                </Link>
                            </div>
                        </div>
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
