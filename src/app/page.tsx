"use client";
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Home3DSection from '@/components/HomeVisualizer/Home3DSection';
import { useSettings } from '@/context/SettingsContext';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const { products } = useSettings();

  return (
    <main className={styles.main}>
      <Navbar />
      <Hero />
      <Features />
      <Home3DSection />

      <section className="section-padding container text-center">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Colecciones Destacadas</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 4rem' }}>
          Explora nuestras cajas más queridas, diseñadas para cada momento especial.
        </p>
        <div className={styles.productGrid}>
          {products.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <img src={product.image} alt={product.name} />
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.price}>${product.price.toLocaleString()}</p>
                <Link href={`/personalizar/${product.id}`} className="btn-primary" style={{ display: 'block' }}>
                  Personalizar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
