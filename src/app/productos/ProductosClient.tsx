"use client";
import { useState, use, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import { getOptimizedUrl } from '@/lib/cloudinary';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Filter, X } from 'lucide-react';
import styles from './productos.module.css';

interface ProductosClientProps {
    categorySlug?: string;
}

export default function ProductosClient({ categorySlug }: ProductosClientProps = {}) {
    const { products, collections, materials } = useSettings();
    const { addToCart, getProductQuantity, updateQuantity, cartItems, openCart, getEffectivePrice } = useCart();
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const activeCollectionFromSlug = categorySlug 
        ? collections.find((c: any) => c.slug === categorySlug)?.id 
        : null;
    
    const activeCollection = activeCollectionFromSlug || searchParams.get('sub_id') || searchParams.get('cat_id') || "Todas";
    const maxPrice = Number(searchParams.get('precio')) || 1000000;
    const sortBy = searchParams.get('ordenar') || 'newest';
    
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

    const updateFilters = (updates: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "Todas" || (key === 'precio' && value === 1000000) || (key === 'ordenar' && value === 'newest')) {
                params.delete(key);
            } else {
                params.set(key, value.toString());
            }
        });
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSelectCollection = (id: string) => {
        if (id === "Todas") {
            router.push('/productos');
        } else {
            const col = collections.find((c: any) => c.id === id);
            if (col?.slug) {
                router.push(`/productos/${col.slug}`);
            } else {
                // Fallback to legacy params if no slug
                if (col?.parentId) {
                    updateFilters({ cat_id: col.parentId, sub_id: col.id });
                } else {
                    updateFilters({ cat_id: id, sub_id: null });
                }
            }
        }
        setIsFiltersOpen(false);
    };

    const reflectsCategory = (colId: string) => activeCollection === colId || collections.find((c: any) => c.id === colId)?.parentId === activeCollection;
    const isParent = (id: string) => collections.some((c: any) => c.parentId === id);
    const getParentOf = (id: string) => collections.find((c: any) => c.id === id)?.parentId;
    const parentCollections = collections.filter((col: any) => !col.parentId);

    const visibleProducts = products.filter(p => p.isVisible !== false);
    const filteredProducts = activeCollection === "Todas"
        ? visibleProducts.filter(p => p.price <= maxPrice)
        : visibleProducts.filter(p => {
            const productCategory = collections.find((c: any) => c.id === p.collectionId);
            const isMatch = p.collectionId === activeCollection || productCategory?.parentId === activeCollection;
            
            // Debugging log for the specific product mentioned or any product being filtered
            if (activeCollection !== "Todas" && (p.name.toLowerCase().includes('rosas') || p.id === activeCollection)) {
                console.log(`[FILTER DEBUG] Product: ${p.name}, Category: ${p.collectionId}, Parent: ${productCategory?.parentId}, Active: ${activeCollection}, Match: ${isMatch}`);
            }
            
            return isMatch && p.price <= maxPrice;
        });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        return (new Date(b.createdAt || 0)).getTime() - (new Date(a.createdAt || 0)).getTime();
    });

    const toggleAccordion = (id: string) => {
        setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const currentCategoryName = activeCollection === "Todas" 
        ? "Todas las Piezas" 
        : collections.find((c: any) => c.id === activeCollection)?.name;

    return (
        <main>
            <Navbar />
            <section className="section-padding container">
                <header className={styles.header}>
                    <h1>Nuestros Productos</h1>
                    <p>Explora nuestras creaciones diseñadas para cada historia especial.</p>
                </header>

                <button className={styles.mobileFilterBtn} onClick={() => setIsFiltersOpen(true)}>
                    <Filter size={18} />
                    <span>Filtros</span>
                </button>

                {isFiltersOpen && <div className={styles.sidebarOverlay} onClick={() => setIsFiltersOpen(false)} />}
                
                <div className={styles.shopLayout}>
                    <aside className={`${styles.sidebar} ${isFiltersOpen ? styles.sidebarOpen : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Filtros</h2>
                            <button onClick={() => setIsFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>Categorías</h3>
                            <div className={styles.accordionItem}>
                                <div 
                                    className={`${styles.accordionHeader} ${activeCollection === "Todas" ? styles.active : ''}`}
                                    onClick={() => handleSelectCollection("Todas")}
                                >
                                    <span>Ver Todas</span>
                                </div>
                            </div>
                            {parentCollections.map((parent: any) => {
                                const children = collections.filter((c: any) => c.parentId === parent.id);
                                const isExpanded = expandedParents[parent.id] || activeCollection === parent.id || getParentOf(activeCollection) === parent.id;
                                return (
                                    <div key={parent.id} className={styles.accordionItem}>
                                        <div className={styles.accordionHeader}>
                                            <span className={activeCollection === parent.id ? styles.active : ''} onClick={() => handleSelectCollection(parent.id)} style={{ flex: 1, paddingRight: '1rem' }}>
                                                {parent.name}
                                            </span>
                                            {children.length > 0 && (
                                                <button onClick={(e) => { e.stopPropagation(); toggleAccordion(parent.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem', color: '#64748b' }}>
                                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                </button>
                                            )}
                                        </div>
                                        {isExpanded && children.length > 0 && (
                                            <div className={styles.accordionContent}>
                                                {children.map((child: any) => (
                                                    <button key={child.id} className={`${styles.childBtn} ${activeCollection === child.id ? styles.active : ''}`} onClick={() => handleSelectCollection(child.id)}>
                                                        {child.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.filterGroup}>
                            <h3>Precio Máximo</h3>
                            <input type="range" min="0" max="2000000" step="10000" value={maxPrice} onChange={(e) => updateFilters({ precio: Number(e.target.value) })} className={styles.rangeInput} />
                            <div className={styles.priceLabels}>
                                <span>$0</span>
                                <span>${maxPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </aside>

                    <div className={styles.productArea}>
                        <div className={styles.toolbar}>
                            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                                Explorando: <span>{currentCategoryName}</span>
                            </nav>
                            <select className={styles.sortSelect} value={sortBy} onChange={(e) => updateFilters({ ordenar: e.target.value })}>
                                <option value="newest">Más Relevantes</option>
                                <option value="priceAsc">Precio: Menor a Mayor</option>
                                <option value="priceDesc">Precio: Mayor a Menor</option>
                            </select>
                        </div>
                        <div className={styles.grid}>
                            {sortedProducts.map(product => {
                                const qtyInCart = getProductQuantity(product.id);
                                const baseCartItem = cartItems.find(i => i.productId === product.id && !i.customText);
                                const handleIncrease = (e: React.MouseEvent) => {
                                    e.preventDefault();
                                    if (baseCartItem) updateQuantity(baseCartItem.id, baseCartItem.quantity + 1);
                                    else addToCart({ productId: product.id, name: product.name, image: getOptimizedUrl(product.image, 150) || '/placeholder.png', quantity: 1, unitPrice: product.price });
                                };
                                const handleDecrease = (e: React.MouseEvent) => {
                                    e.preventDefault();
                                    if (baseCartItem) updateQuantity(baseCartItem.id, baseCartItem.quantity - 1);
                                };

                                const hasConfigurableVariants = product.variants && product.variants.some((v: any) => v.attributes && v.attributes.length > 0);
                                const hasCustomGallery = product.images && product.images.some((img: any) => img && typeof img === 'object' && img.isCustomizable);
                                const is3D = (product.displayMode === '3d' || product.displayMode === 'both' || !product.displayMode) && !!product.modelUrl;
                                const requiresCustomization = hasConfigurableVariants || hasCustomGallery || is3D;

                                return (
                                    <div key={product.id} className={styles.card} style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Link href={`/personalizar/${product.slug || product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', flex: 1 }}>
                                            <div className={styles.imageBox}>
                                                <img src={getOptimizedUrl(product.image, 600) || '/placeholder.png'} alt={product.name} loading="lazy" />
                                            </div>
                                            <div className={styles.info}>
                                                <span className={styles.category}>{collections.find((c: any) => c.id === product.collectionId)?.name}</span>
                                                <h3>{product.name}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <p className={styles.price} style={getEffectivePrice({ productId: product.id, unitPrice: product.price, quantity: 0 }) < product.price ? { fontWeight: 600, color: 'var(--primary)', margin: 0 } : { margin: 0 }}>
                                                        ${getEffectivePrice({ productId: product.id, unitPrice: product.price, quantity: 0 }).toLocaleString()}
                                                    </p>
                                                    {getEffectivePrice({ productId: product.id, unitPrice: product.price, quantity: 0 }) < product.price && (
                                                        <span style={{ fontSize: '0.75rem', background: '#e0ffe0', color: '#008000', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>x Mayor</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                        <div style={{ padding: '0 1.5rem 1.5rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {qtyInCart > 0 && (
                                                <div style={{ textAlign: 'center', padding: '0.4rem', background: '#f0fdf4', color: '#166534', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #dcfce3' }}>
                                                    Tienes {qtyInCart} en tu cesta
                                                </div>
                                            )}
                                            {requiresCustomization ? (
                                                <Link 
                                                    href={`/personalizar/${product.slug || product.id}`}
                                                    className={`${styles.productBtn} btn-primary`}
                                                    style={{ textAlign: 'center', display: 'block', width: '100%', border: 'none', padding: '0.8rem', borderRadius: '8px', textDecoration: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600 }}
                                                >
                                                    Elegir Variante
                                                </Link>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    {qtyInCart > 0 ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, background: '#f9f9f9', padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                                            <button onClick={handleDecrease} disabled={!baseCartItem} style={{ padding: '0.2rem 0.8rem', background: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: baseCartItem ? 'pointer' : 'not-allowed' }}>-</button>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Añadir</span>
                                                            <button onClick={handleIncrease} style={{ padding: '0.2rem 0.8rem', background: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            className={`${styles.productBtn} btn-primary`}
                                                            style={{ flex: 1, border: 'none', cursor: 'pointer', padding: '0.8rem', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 600 }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                addToCart({ productId: product.id, name: product.name, image: getOptimizedUrl(product.image, 150) || '/placeholder.png', quantity: 1, unitPrice: product.price });
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
                        {sortedProducts.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>No se encontraron productos que coincidan con estos filtros.</p>
                                <button onClick={() => updateFilters({ cat_id: null, sub_id: null, precio: 1000000 })} className="btn-secondary" style={{ marginTop: '1rem' }}>Limpiar Filtros</button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
