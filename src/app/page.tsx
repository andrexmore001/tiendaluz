"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import SplitHero from '@/components/HomeVisualizer/SplitHero';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ReviewCarousel from '@/components/ReviewCarousel/ReviewCarousel';
import Footer from '@/components/Footer';
import CategoryCarousel from '@/components/CategoryCarousel/CategoryCarousel';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import { getOptimizedUrl } from '@/lib/cloudinary';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import styles from './page.module.css';
import { getRotatedImage } from '@/lib/imageRotation';

export default function Home() {
  const { products, collections, settings } = useSettings();
  const { addToCart, getProductQuantity, updateQuantity, cartItems, openCart, getEffectivePrice } = useCart();

  const layout = settings.homepageLayout || ['categories', 'hero', 'split-hero', 'features', 'products', 'reviews'];

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'categories':
        return (
          <section key="categories" className="container" style={{ paddingTop: '0.8rem', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
            <CategoryCarousel collections={collections} products={products} title="¿Buscas algo específico?" />
          </section>
        );
      case 'hero':
        return <Hero key="hero" />;
      case 'split-hero':
        return <SplitHero key="split-hero" />;
      case 'features':
        return <Features key="features" />;
      case 'reviews':
        return <ReviewCarousel key="reviews" reviews={settings.reviews || []} />;
      case 'products':
        return (
          <section key="products" className="section-padding container text-center">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Productos Destacados</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 4rem' }}>
              Explora nuestras cajas más queridas, diseñadas para cada momento especial.
            </p>
            <div className={styles.productGrid}>
              {[...products]
                .filter((p: any) => p.isVisible !== false)
                .slice(0, 6).map((product: any) => {
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

                const hasConfigurableVariants = product.variants && product.variants.some((v: any) => v.attributes && v.attributes.length > 0);
                const hasCustomGallery = product.images && product.images.some((img: any) => img && typeof img === 'object' && img.isCustomizable);
                const requiresCustomization = hasConfigurableVariants || hasCustomGallery;

                // Calculate rotated image
                const activeImage = getRotatedImage(product, settings?.rotationInterval || 3);

                return (
                  <div key={product.id} className={styles.productCard} style={{ display: 'flex', flexDirection: 'column' }}>
                    {(product as any).hasRibbon && (
                      <div className="global-ribbon" style={{ backgroundColor: (product as any).ribbonColor || '#D4AF37' }}>
                        {(product as any).ribbonText || 'Especial'}
                      </div>
                    )}
                    <Link href={`/personalizar/${product.slug || product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', flex: 1 }}>
                      <div className={styles.productImage}>
                        <img src={getOptimizedUrl(activeImage, 500) || '/placeholder.png'} alt={product.name} loading="lazy" />
                      </div>
                      <div className={styles.productInfo}>
                        {product.collectionId && (
                          <span className={styles.productCategory}>
                            {collections.find((c: any) => c.id === product.collectionId)?.name}
                          </span>
                        )}
                        <h3>{product.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <p className={styles.price} style={getEffectivePrice({ productId: product.id, unitPrice: product.price, quantity: 0 }) < product.price ? { fontWeight: 600, color: 'var(--primary)' } : {}}>
                            ${formatPrice(getEffectivePrice({ productId: product.id, unitPrice: product.price, quantity: 0 }))}
                          </p>
                          {getEffectivePrice({ productId: product.id, unitPrice: product.price, quantity: 0 }) < product.price && (
                            <span style={{ fontSize: '0.75rem', background: '#e0ffe0', color: '#008000', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>x Mayor</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className={styles.cardFooter}>
                      {qtyInCart > 0 && (
                        <div style={{ textAlign: 'center', padding: '0.4rem', background: '#f0fdf4', color: '#166534', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #dcfce3' }}>
                          Tienes {qtyInCart} en tu cesta
                        </div>
                      )}
                      {requiresCustomization ? (
                        <Link 
                          href={`/personalizar/${product.slug || product.id}`}
                          className="btn-primary" 
                          style={{ textAlign: 'center', display: 'block', width: '100%', textDecoration: 'none', borderRadius: '8px' }}
                        >
                          Elegir Variante
                        </Link>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {qtyInCart > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, background: '#f9f9f9', padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <button onClick={handleDecrease} disabled={!baseCartItem} style={{ padding: '0.2rem 0.5rem', background: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: baseCartItem ? 'pointer' : 'not-allowed' }}>-</button>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Añadir</span>
                                    <button onClick={handleIncrease} style={{ padding: '0.2rem 0.5rem', background: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                                </div>
                            ) : (
                                <button 
                                    className="btn-primary" 
                                    style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: '8px' }}
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {products.length > 6 && (
              <div className={styles.moreActions}>
                <Link href="/productos" className="btn-secondary">
                  Ver Todos los Productos
                </Link>
              </div>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <main className={styles.main}>
      <Navbar />

      {layout.map(sectionId => renderSection(sectionId))}

      <Footer />
    </main>
  );
}
