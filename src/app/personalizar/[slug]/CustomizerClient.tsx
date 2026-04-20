"use client";
import { useState, use, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductModel from "@/components/Three/ProductModel";
import { useSettings } from "@/context/SettingsContext";
import { useCart } from "@/context/CartContext";
import { getOptimizedUrl } from "@/lib/cloudinary";
import { formatPrice } from "@/lib/format";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { Type, Image as ImageIcon, MessageCircle, ShoppingBag } from "lucide-react";
import styles from "./customizer.module.css";
import { Product } from "@/types/product";

interface GalleryItem {
  url: string;
  origin: 'product' | 'variant';
  variantId?: string;
  isCustomizable?: boolean;
  textConfig?: any;
}

// Ayudante para comparar URLs de forma robusta (ignora protocolo y versiones de Cloudinary)
const normalizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '') // Quitar http:// o https://
    .replace(/\/v\d+\//, '/')     // Quitar versiones de Cloudinary (/v123456789/)
    .split('?')[0]               // Quitar parámetros de búsqueda
    .trim();
};

interface CustomizerClientProps {
    id: string;
}

export default function CustomizerClient({ id }: CustomizerClientProps) {
  const { products, settings, materials, isLoaded } = useSettings();
  const { addToCart, updateQuantity, openCart, getProductQuantity, cartItems } = useCart();

  const product = products.find((p) => p.id === id) || products[0];

  const [text, setText] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Variant Logic
  const activeVariants = product?.variants?.filter((v: any) => v.isActive) || [];
  
  const availableAttributes = useMemo(() => {
    if (!product || activeVariants.length === 0) return [];
    const attrs = new Map<string, { id: string, name: string, values: Set<string> }>();
    activeVariants.forEach((v: any) => {
      if (v.attributes && Array.isArray(v.attributes)) {
         v.attributes.forEach((attrObj: any) => {
           const val = attrObj.attributeValue;
           if (val && val.attribute) {
               if (!attrs.has(val.attribute.name)) {
                 attrs.set(val.attribute.name, { id: val.attribute.id, name: val.attribute.name, values: new Set() });
               }
               attrs.get(val.attribute.name)!.values.add(val.value);
           }
         });
      }
    });
    return Array.from(attrs.values()).map((a: any) => ({ ...a, values: Array.from(a.values) }));
  }, [activeVariants, product]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selectedOptions with first available combination
  useEffect(() => {
      if (availableAttributes.length > 0 && Object.keys(selectedOptions).length === 0) {
          const initial: Record<string, string> = {};
          availableAttributes.forEach((a: any) => initial[a.name] = a.values[0]);
          setSelectedOptions(initial);
      }
  }, [availableAttributes]);

  const currentVariant = useMemo(() => {
      if (availableAttributes.length === 0) return null;
      return activeVariants.find((v: any) => {
          if (!v.attributes) return false;
          return availableAttributes.every((attr: any) => {
              const variantAttr = v.attributes.find((a: any) => a.attributeValue.attribute.name === attr.name);
              return variantAttr && variantAttr.attributeValue.value === selectedOptions[attr.name];
          });
      }) || activeVariants[0];
  }, [selectedOptions, activeVariants, availableAttributes]);

  // Sync with global cart quantity for this specific variant
  useEffect(() => {
    if (product) {
      const globalQty = getProductQuantity(product.id, currentVariant?.id || null);
      if (globalQty > 0) {
        setQuantity(globalQty);
      } else {
        setQuantity(1);
      }
    }
  }, [product, getProductQuantity, cartItems, currentVariant?.id]);

  const currentMaterial = product ?
    (materials.find((m) => m.id === product.materialId) ||
    materials.find((m) => m.id === "carton-kraft")) : undefined;

  const [currentView, setCurrentView] = useState<'3d' | 'photos'>(product?.displayMode === 'photos' ? 'photos' : '3d');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    if (product) {
      setCurrentView(product.displayMode === 'photos' ? 'photos' : '3d');
    }
  }, [product?.displayMode]);

  const combinedGallery = useMemo(() => {
    if (!product) return [];
    
    // 1. Fotos generales del producto
    const basePhotos: GalleryItem[] = (product.images && product.images.length > 0) 
        ? product.images.map((img: any) => ({
            url: typeof img === 'string' ? img : img.url,
            isCustomizable: img.isCustomizable,
            textConfig: img.textConfig,
            origin: 'product'
        }))
        : [{ url: product.image, origin: 'product' }];

    // 2. Fotos de las variantes activas (solo las que tengan imagen propia)
    const variantPhotos: GalleryItem[] = activeVariants
        .filter((v: any) => v.image)
        .map((v: any) => ({
            url: v.image,
            variantId: v.id,
            origin: 'variant'
        }));

    // Unificar y eliminar duplicados por URL normalizada
    const uniqueGallery: GalleryItem[] = [];
    const seenNormalizedUrls = new Set<string>();

    [...basePhotos, ...variantPhotos].forEach(photo => {
        if (!photo.url) return;
        const normalized = normalizeUrl(photo.url);
        
        if (!seenNormalizedUrls.has(normalized)) {
            seenNormalizedUrls.add(normalized);
            uniqueGallery.push(photo);
        } else if (photo.variantId) {
            // Si la foto ya existe (quizá como foto general) pero esta entrada tiene un variantId, vincularlo
            const existing = uniqueGallery.find(p => normalizeUrl(p.url) === normalized);
            if (existing && !existing.variantId) {
                existing.variantId = photo.variantId;
            }
        }
    });

    return uniqueGallery;
  }, [product, activeVariants]);

  // Sincronizar Variante -> Foto: Cuando cambia la variante, saltar a su foto en la galería
  useEffect(() => {
    if (currentVariant && currentVariant.image) {
      const targetNormalized = normalizeUrl(currentVariant.image);
      const idx = combinedGallery.findIndex(p => normalizeUrl(p.url) === targetNormalized);
      if (idx !== -1) {
        setActivePhotoIdx(idx);
      }
    }
  }, [currentVariant?.id, combinedGallery]);

  if (!isLoaded || !product) {
    return (
      <main style={{ minHeight: "100vh", background: "#fcfcfc", display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>{!isLoaded ? "Cargando producto..." : "Producto no encontrado"}</p>
        </div>
        <Footer />
      </main>
    );
  }

  // Función para manejar el clic en miniatura con sincronización inversa
  const handlePhotoClick = (idx: number) => {
    setActivePhotoIdx(idx);
    const photo = combinedGallery[idx];
    
    // Si la foto pertenece a una variante, actualizar los selectores de atributos
    if (photo && photo.variantId) {
      const variant = activeVariants.find((v: any) => v.id === photo.variantId);
      if (variant && variant.attributes) {
        const newOptions = { ...selectedOptions };
        variant.attributes.forEach((attrObj: any) => {
          newOptions[attrObj.attributeValue.attribute.name] = attrObj.attributeValue.value;
        });
        setSelectedOptions(newOptions);
      }
    }
  };

  const getTieredPrice = () => {
    const basePrice = currentVariant?.price !== null && currentVariant?.price !== undefined ? currentVariant.price : product.price;
    if (!product.priceTiers || product.priceTiers.length === 0) return basePrice;

    // Calcular la cantidad a evaluar considerando el estado de la regla híbrida
    const totalOtherVariants = product.combineVariantsForTiers
      ? getProductQuantity(product.id) - getProductQuantity(product.id, currentVariant?.id || null)
      : 0;
      
    const evaluationQty = quantity + totalOtherVariants;

    const activeTier = product.priceTiers.find(tier => {
      const minMatch = evaluationQty >= tier.minQty;
      const maxMatch = tier.maxQty === null || tier.maxQty === undefined || evaluationQty <= tier.maxQty;
      return minMatch && maxMatch;
    });
    if (!activeTier) return basePrice;
    
    // Aplicar el descuento proporcionalmente según el precio de la variante
    const discountFactor = product.price > 0 ? (activeTier.unitPrice / product.price) : 1;
    return Math.round(basePrice * discountFactor);
  };

  const currentUnitPrice = getTieredPrice();

    // Handle WhatsApp removed as user requested global floating button instead
    // const handleWhatsApp = () => { ... }

  return (
    <main style={{ minHeight: "100vh", background: "#fcfcfc" }}>
      <Navbar />
      <div className={`${styles.container} container`}>
        <div className={styles.visualizer}>
          {currentView === '3d' ? (
            <div style={{ width: '100%', height: '400px' }}>
              <ProductModel modelUrl={product.modelUrl} />
            </div>
          ) : (
            <div className={styles.photoGallery}>
              <div className={styles.mainPhotoWrapper}>
                <div className={styles.imageRelativeWrapper} style={{ position: 'relative' }}>
                  {(product as any).hasRibbon && (
                    <div className="global-ribbon" style={{ backgroundColor: (product as any).ribbonColor || '#D4AF37' }}>
                      {(product as any).ribbonText || 'Especial'}
                    </div>
                  )}
                  {/* Si el currentVariant tiene imagen, usarla como base si no hay galerías custom */}
                  <img src={getOptimizedUrl(
                    combinedGallery[activePhotoIdx]?.url || product.image || '', 
                    800
                  )} alt={product.name} />
                  {text && combinedGallery[activePhotoIdx]?.isCustomizable && (
                    <div
                      className={styles.textOverlay}
                      style={{
                        top: `${(combinedGallery[activePhotoIdx] as any).textConfig?.y ?? 50}%`,
                        left: `${(combinedGallery[activePhotoIdx] as any).textConfig?.x ?? 50}%`,
                        transform: `translate(-50%, -50%) rotate(${(combinedGallery[activePhotoIdx] as any).textConfig?.rotation ?? 0}deg) scale(${(combinedGallery[activePhotoIdx] as any).textConfig?.scale ?? 1})`,
                      }}
                    >
                      {text}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.photoThumbs}>
                {combinedGallery.map((img: any, idx) => (
                  <img
                    key={idx}
                    src={getOptimizedUrl(img.url, 150)}
                    alt={`Thumb ${idx}`}
                    onClick={() => handlePhotoClick(idx)}
                    style={{ border: activePhotoIdx === idx ? '2px solid var(--primary)' : undefined }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className={styles.visualizerControls} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
            {product.displayMode === 'both' && (
              <button
                className={styles.pBtn}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}
                onClick={() => setCurrentView(currentView === '3d' ? 'photos' : '3d')}
              >
                {currentView === '3d' ? "Ver Fotos" : "Ver 3D"}
              </button>
            )}
          </div>
        </div>
        <aside className={styles.controls}>
          <div className={styles.productHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1>{product.name}</h1>
              {getProductQuantity(product.id) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--secondary)', color: 'var(--text-color)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <ShoppingBag size={14} />
                  {getProductQuantity(product.id)} en carrito
                </div>
              )}
            </div>
            <p className={styles.price}>
              ${formatPrice(currentUnitPrice)} <span className={styles.unitText}>por unidad</span>
              {currentUnitPrice < product.price && (
                <span style={{ fontSize: '0.8rem', background: '#e0ffe0', color: '#008000', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem', fontWeight: 600 }}>¡Precio por Volumen!</span>
              )}
            </p>
          </div>

          {availableAttributes.length > 0 && (
             <div className={styles.variantsSection} style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {availableAttributes.map((attr: any) => (
                   <div key={attr.id} style={{ marginBottom: '1rem' }}>
                      <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>{attr.name}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {attr.values.map((val: any) => (
                           <button
                             key={val}
                             onClick={() => setSelectedOptions(prev => ({ ...prev, [attr.name]: val }))}
                             style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: selectedOptions[attr.name] === val ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                                background: selectedOptions[attr.name] === val ? '#fff1f2' : 'white',
                                color: selectedOptions[attr.name] === val ? 'var(--primary)' : '#475569',
                                fontWeight: selectedOptions[attr.name] === val ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                             }}
                           >
                              {val}
                           </button>
                        ))}
                      </div>
                   </div>
                ))}
                {currentVariant && currentVariant.stock < 10 && currentVariant.stock > 0 && (
                    <p style={{ color: '#d97706', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>¡Solo {currentVariant.stock} disponibles!</p>
                )}
                {currentVariant && currentVariant.stock === 0 && (
                     <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Agotado en esta combinación</p>
                )}
             </div>
          )}

          <div className={styles.productHeader} style={{ marginBottom: '1.5rem' }}>
            <p className={styles.description} style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{product.description}</p>
          </div>



          {product.priceTiers && product.priceTiers.length > 0 && (
            <div className={styles.pricingTableCard}>
              <div className={styles.tableHeader}>
                <span>Cantidad</span>
                <span>Precio Unit.</span>
              </div>
              <div className={styles.tableBody}>
                {product.priceTiers[0].minQty > 1 && (
                  <div className={`${styles.tableRow} ${quantity < product.priceTiers[0].minQty ? styles.activeRow : ''}`}>
                    <span>1 - {product.priceTiers[0].minQty - 1}</span>
                    <span>${formatPrice(currentVariant?.price ?? product.price)}</span>
                  </div>
                )}
                {product.priceTiers.map((tier, idx) => {
                  const isActive = quantity >= tier.minQty && (tier.maxQty === null || tier.maxQty === undefined || quantity <= tier.maxQty);
                  const label = tier.maxQty ? `${tier.minQty} - ${tier.maxQty}` : `${tier.minQty}+`;
                  
                  // Calcular dinámicamente el precio de esta escala basándose en la variante actual
                  const basePrice = currentVariant?.price ?? product.price;
                  const discountFactor = product.price > 0 ? (tier.unitPrice / product.price) : 1;
                  const tierPrice = Math.round(basePrice * discountFactor);
                  const discount = basePrice > 0 ? Math.round(((basePrice - tierPrice) / basePrice) * 100) : 0;
                  
                  return (
                    <div key={tier.id || idx} className={`${styles.tableRow} ${isActive ? styles.activeRow : ''}`}>
                      <div className={styles.tierInfo}>
                        <span>{label} unidades</span>
                        {discount > 0 && <span className={styles.savingsBadge}>Ahorra {discount}%</span>}
                      </div>
                      <span className={styles.tierPrice}>${formatPrice(tierPrice)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {(() => {
            const is3D = (product.displayMode === '3d' || product.displayMode === 'both' || !product.displayMode) && !!product.modelUrl;
            const hasCustomGallery = product.images && product.images.some((img: any) => img && typeof img === 'object' && img.isCustomizable);
            if (is3D || hasCustomGallery) {
              return (
                <div className={styles.customSection}>
                  <h3><Type size={18} /> Texto Personalizado</h3>
                  <input
                    type="text"
                    placeholder="Escribe el mensaje para la caja..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={styles.input}
                  />
                  <p className={styles.customInfoText}>
                    * Nota: La personalización cuenta con un costo adicional que no está incluido en el precio base del producto y será calculado al confirmar el pedido.
                  </p>
                </div>
              );
            }
            return null;
          })()}
          <div className={styles.footer}>
            <div className={styles.qtyRow}>
              <div className={styles.qtySelector}>
                <button onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>-</button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setQuantity(Math.max(1, val));
                    else if (e.target.value === '') setQuantity(0);
                  }}
                  onBlur={() => { if (quantity < 1) setQuantity(1); }}
                  className={styles.qtyInput}
                />
                <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
              </div>
              <div className={styles.totalInfo}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalValue}>${formatPrice(currentUnitPrice * quantity)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => {
                  const normalizedText = text || undefined;
                  const targetVariantId = currentVariant?.id;
                  
                  const existingItem = cartItems.find(item => 
                      item.productId === product.id && 
                      item.variantId === targetVariantId && 
                      item.customText === normalizedText
                  );

                  if (existingItem) updateQuantity(existingItem.id, quantity);
                  else {
                    addToCart({
                      productId: product.id,
                      variantId: targetVariantId,
                      name: currentVariant ? `${product.name} (${Object.values(selectedOptions).join(', ')})` : product.name,
                      image: getOptimizedUrl(combinedGallery[0]?.url || product.image || '/placeholder.png', 150),
                      quantity: quantity,
                      unitPrice: currentVariant?.price !== null && currentVariant?.price !== undefined ? currentVariant.price : product.price,
                      customText: normalizedText
                    });
                  }
                  openCart();
                }}
              >
                <ShoppingBag size={20} />
                Añadir al Carrito
              </button>
            </div>
          </div>
        </aside>
      </div>
      <Footer />
    </main>
  );
}
