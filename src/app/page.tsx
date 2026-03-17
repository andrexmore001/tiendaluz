"use client";
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import dynamic from 'next/dynamic';
const Home3DSection = dynamic(() => import('@/components/HomeVisualizer/Home3DSection'), {
  ssr: false,
  loading: () => <div className="section-padding container text-center">Cargando visualizador...</div>
});
import Footer from '@/components/Footer';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import { getOptimizedUrl } from '@/lib/cloudinary';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const { products } = useSettings();
  const { addToCart, getProductQuantity, updateQuantity, cartItems, openCart, getEffectivePrice } = useCart();

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
          {products.slice(0, 4).map(product => {
            const qtyInCart = getProductQuantity(product.id);
            const baseCartItem = cartItems.find(i => i.productId === product.id && !i.customText);

            const handleIncrease = (e: React.MouseEvent) => {
              e.preventDefault();
              if (baseCartItem) {
                updateQuantity(baseCartItem.id, baseCartItem.quantity + 1);
              } else {
                addToCart({
                  productId: product.id,
                  name: product.name,
                  image: getOptimizedUrl(product.image, 150) || '/placeholder.png',
                  quantity: 1,
                  unitPrice: product.price
                });
              }
            };

            const handleDecrease = (e: React.MouseEvent) => {
              e.preventDefault();
              if (baseCartItem) {
                updateQuantity(baseCartItem.id, baseCartItem.quantity - 1);
              }
            };

            return (
              <div key={product.id} className={styles.productCard} style={{ display: 'flex', flexDirection: 'column' }}>
                <Link href={`/personalizar/${product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', flex: 1 }}>
                  <div className={styles.productImage}>
                    <img src={getOptimizedUrl(product.image, 500) || '/placeholder.png'} alt={product.name} loading="lazy" />
                  </div>
                  <div className={styles.productInfo}>
                    <h3>{product.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <p className={styles.price} style={getEffectivePrice(product.id, product.price) < product.price ? { fontWeight: 600, color: 'var(--primary)' } : {}}>
                        ${getEffectivePrice(product.id, product.price).toLocaleString()}
                      </p>
                      {getEffectivePrice(product.id, product.price) < product.price && (
                        <span style={{ fontSize: '0.75rem', background: '#e0ffe0', color: '#008000', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>x Mayor</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div style={{ padding: '0 1.5rem 1.5rem', marginTop: 'auto' }}>
                  {qtyInCart > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f9f9', padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                      <button onClick={handleDecrease} disabled={!baseCartItem} style={{ padding: '0.2rem 0.8rem', background: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: baseCartItem ? 'pointer' : 'not-allowed' }}>-</button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{qtyInCart} en carrito</span>
                      <button onClick={handleIncrease} style={{ padding: '0.2rem 0.8rem', background: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                    </div>
                  ) : (
                    <button 
                      className="btn-primary" 
                      style={{ display: 'block', width: '100%', border: 'none', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          productId: product.id,
                          name: product.name,
                          image: getOptimizedUrl(product.image, 150) || '/placeholder.png',
                          quantity: 1,
                          unitPrice: product.price
                        });
                        openCart();
                      }}
                    >
                      Añadir al carrito
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {products.length > 4 && (
          <div className={styles.moreActions}>
            <Link href="/productos" className="btn-secondary">
              Ver Todos los Productos
            </Link>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
