"use client";
import { useState, use, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductModel from "@/components/Three/ProductModel";
import { useSettings } from "@/context/SettingsContext";
import { useCart } from "@/context/CartContext";
import { getOptimizedUrl } from "@/lib/cloudinary";
import { Type, Image as ImageIcon, MessageCircle, ShoppingBag } from "lucide-react";
import styles from "./customizer.module.css";

export default function CustomizerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { products, settings, materials, isLoaded } = useSettings();
  const { addToCart, openCart, getProductQuantity, cartItems } = useCart();

  const product = products.find((p) => p.id === id) || products[0];

  const [text, setText] = useState("");
  const [quantity, setQuantity] = useState(1);

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

  const displayPhotos = product.images && product.images.length > 0 ? product.images : [product.image];

  // Calculate tiered price
  const getTieredPrice = () => {
    if (!product.priceTiers || product.priceTiers.length === 0) return product.price;

    // Find the tier that matches the quantity
    const activeTier = product.priceTiers.find(tier => {
      const minMatch = quantity >= tier.minQty;
      const maxMatch = tier.maxQty === null || tier.maxQty === undefined || quantity <= tier.maxQty;
      return minMatch && maxMatch;
    });

    return activeTier ? activeTier.unitPrice : product.price;
  };

  const currentUnitPrice = getTieredPrice();

  const handleWhatsApp = () => {
    const phoneNumber = settings.contact.phone.replace(/\s+/g, "");
    const currentItemTotal = currentUnitPrice * quantity;

    let message = "Hola, me gustaría realizar el siguiente pedido:\n\n";
    let grandTotal = currentItemTotal;

    // 1. Add current item being customized
    message += `1. ${quantity}x ${product.name} - $${currentItemTotal.toLocaleString()}`;
    if (text) {
      message += `\n   Texto: "${text}"`;
    }
    message += "\n\n";

    // 2. Add existing cart items if any
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach((item, index) => {
        const itemTotal = item.unitPrice * item.quantity;
        grandTotal += itemTotal;
        message += `${index + 2}. ${item.quantity}x ${item.name} - $${itemTotal.toLocaleString()}`;
        if (item.customText) {
          message += `\n   Texto: "${item.customText}"`;
        }
        message += "\n\n";
      });
    }

    message += `*Total estimado:* $${grandTotal.toLocaleString()}COP`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#fcfcfc" }}>
      <Navbar />

      <div className={`${styles.container} container`}>
        <div className={styles.visualizer}>
          <div className={styles.badge}>
            {currentView === '3d' ? 'Vista Previa' : 'Galería de Fotos'}
          </div>

          {currentView === '3d' ? (
            <div style={{ width: '100%', height: '400px' }}>
              <ProductModel modelUrl={product.modelUrl} />
            </div>
          ) : (
            <div className={styles.photoGallery}>
              <div className={styles.mainPhotoWrapper}>
                <div className={styles.imageRelativeWrapper}>
                  <img src={getOptimizedUrl(displayPhotos[activePhotoIdx] ? (typeof displayPhotos[activePhotoIdx] === 'string' ? displayPhotos[activePhotoIdx] : (displayPhotos[activePhotoIdx] as any).url) : (product.image || ''), 800)} alt={product.name} />
                  {text && displayPhotos[activePhotoIdx] && (displayPhotos[activePhotoIdx] as any).isCustomizable && (
                    <div
                      className={styles.textOverlay}
                      style={{
                        top: `${(displayPhotos[activePhotoIdx] as any).textConfig?.y ?? 50}%`,
                        left: `${(displayPhotos[activePhotoIdx] as any).textConfig?.x ?? 50}%`,
                        transform: `translate(-50%, -50%) rotate(${(displayPhotos[activePhotoIdx] as any).textConfig?.rotation ?? 0}deg) scale(${(displayPhotos[activePhotoIdx] as any).textConfig?.scale ?? 1})`,
                      }}
                    >
                      {text}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.photoThumbs}>
                {displayPhotos.map((img: any, idx) => (
                  <img
                    key={idx}
                    src={getOptimizedUrl(typeof img === 'string' ? img : img.url, 150)}
                    alt={`Thumb ${idx}`}
                    onClick={() => setActivePhotoIdx(idx)}
                    style={{
                      border: activePhotoIdx === idx ? '2px solid var(--primary)' : undefined
                    }}
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
              ${currentUnitPrice.toLocaleString()} <span className={styles.unitText}>por unidad</span>
            </p>
            <p className={styles.description} style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
          </div>

          {/* TABLA DE PRECIOS POR VOLUMEN */}
          {product.priceTiers && product.priceTiers.length > 0 && (
            <div className={styles.pricingTableCard}>
              <div className={styles.tableHeader}>
                <span>Cantidad</span>
                <span>Precio Unit.</span>
              </div>
              <div className={styles.tableBody}>
                {/* Pre-tier (range from 1 to the first tier's minQty - 1 if it starts > 1) */}
                {product.priceTiers[0].minQty > 1 && (
                  <div className={`${styles.tableRow} ${quantity < product.priceTiers[0].minQty ? styles.activeRow : ''}`}>
                    <span>1 - {product.priceTiers[0].minQty - 1}</span>
                    <span>${product.price.toLocaleString()}</span>
                  </div>
                )}

                {product.priceTiers.map((tier, idx) => {
                  const isActive = quantity >= tier.minQty && (tier.maxQty === null || tier.maxQty === undefined || quantity <= tier.maxQty);
                  const label = tier.maxQty ? `${tier.minQty} - ${tier.maxQty}` : `${tier.minQty}+`;
                  const discount = product.price > 0
                    ? Math.round(((product.price - tier.unitPrice) / product.price) * 100)
                    : 0;

                  return (
                    <div key={tier.id || idx} className={`${styles.tableRow} ${isActive ? styles.activeRow : ''}`}>
                      <div className={styles.tierInfo}>
                        <span>{label} unidades</span>
                        {discount > 0 && <span className={styles.savingsBadge}>Ahorra {discount}%</span>}
                      </div>
                      <span className={styles.tierPrice}>${tier.unitPrice.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conditionally show text input if 3D mode or at least one image is customizable */}
          {(() => {
            const is3D = product.displayMode === '3d' || product.displayMode === 'both' || !product.displayMode;
            const hasCustomGallery = product.images && product.images.some((img: any) => img && typeof img === 'object' && img.isCustomizable);

            if (is3D || hasCustomGallery) {
              return (
                <div className={styles.customSection}>
                  <h3>
                    <Type size={18} /> Texto Personalizado
                  </h3>
                  <input
                    type="text"
                    placeholder="Escribe el mensaje para la caja..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={styles.input}
                  />
                </div>
              );
            }
            return null;
          })()}

          {/* SECTION: FOTOGRAFÍA ESPECIAL - OCULTO POR AHORA POR UX */}
          {/* <div className={styles.customSection}>
            <h3>
              <ImageIcon size={18} /> Fotografía Especial
            </h3>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={includeImage}
                onChange={(e) => setIncludeImage(e.target.checked)}
              />
              <span>Deseo incluir una fotografía impresa</span>
            </label>
          </div> */}

          <div className={styles.footer}>
            <div className={styles.qtyRow}>
              <div className={styles.qtySelector}>
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setQuantity(Math.max(1, val));
                    else if (e.target.value === '') setQuantity(0); // Allow clearing while typing
                  }}
                  onBlur={() => {
                    if (quantity < 1) setQuantity(1);
                  }}
                  className={styles.qtyInput}
                />
                <button onClick={() => setQuantity((prev) => prev + 1)}>
                  +
                </button>
              </div>

              <div className={styles.totalInfo}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalValue}>${(currentUnitPrice * quantity).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => {
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    image: getOptimizedUrl(displayPhotos[0] ? (typeof displayPhotos[0] === 'string' ? displayPhotos[0] : (displayPhotos[0] as any).url) : product.image || '', 150) || '/placeholder.png',
                    quantity: quantity,
                    unitPrice: currentUnitPrice,
                    customText: text || undefined
                  });
                  openCart();
                }}
              >
                <ShoppingBag size={20} />
                Añadir al Carrito
              </button>

              <button
                className={styles.whatsappBtn}
                onClick={handleWhatsApp}
              >
                <MessageCircle size={20} />
                Comprar Ahora
              </button>
            </div>
          </div>
        </aside>
      </div>
      <Footer />
    </main>
  );
}