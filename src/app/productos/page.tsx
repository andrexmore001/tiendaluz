"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import { getOptimizedUrl } from '@/lib/cloudinary';
import Link from 'next/link';
import styles from './productos.module.css';

export default function ProductosPage() {
    const { products, collections } = useSettings();
    const { addToCart, getProductQuantity, updateQuantity, cartItems, openCart, getEffectivePrice } = useCart();
    const [activeCollection, setActiveCollection] = useState("Todas");

    const visibleProducts = products.filter(p => p.isVisible !== false);
    const filteredProducts = activeCollection === "Todas"
        ? visibleProducts
        : visibleProducts.filter(p => p.category === activeCollection);

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
                    {[...filteredProducts]
                        .map(product => {
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
                            <div key={product.id} className={styles.card} style={{ display: 'flex', flexDirection: 'column' }}>
                                <Link href={`/personalizar/${product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', flex: 1 }}>
                                    <div className={styles.imageBox}>
                                        <img src={getOptimizedUrl(product.image, 600) || '/placeholder.png'} alt={product.name} />
                                    </div>
                                    <div className={styles.info}>
                                        <span className={styles.category}>{product.category}</span>
                                        <h3>{product.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <p className={styles.price} style={getEffectivePrice(product.id, product.price) < product.price ? { fontWeight: 600, color: 'var(--primary)', margin: 0 } : { margin: 0 }}>
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
                                            className={`${styles.productBtn} btn-primary`}
                                            style={{ display: 'block', width: '100%', border: 'none', cursor: 'pointer', padding: '0.8rem', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 600 }}
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
